// MEDMIND's Windows entry point. Build twice with -ldflags "-X main.surface=patient|doctor".
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"time"
	"unsafe"
)

var surface = "patient"

const baseURL = "http://127.0.0.1:3001"

func main() {
	if err := launch(); err != nil {
		message("MEDMIND could not start", err.Error()+"\n\nExtract the whole ZIP before running the EXE. If port 3001 is in use, close that program and try again.")
	}
}

func launch() error {
	if surface != "patient" && surface != "doctor" {
		return fmt.Errorf("invalid MEDMIND entry point")
	}
	executable, err := os.Executable()
	if err != nil { return err }
	root := filepath.Dir(executable)
	node := filepath.Join(root, "runtime", "node.exe")
	server := filepath.Join(root, "server", "index.js")
	for _, file := range []string{node, server, filepath.Join(root, "dist", surface, "index.html")} {
		if _, err := os.Stat(file); err != nil { return fmt.Errorf("required file missing: %s", file) }
	}
	if !ready() {
		data := filepath.Join(root, "data")
		if err := os.MkdirAll(data, 0700); err != nil { return err }
		log, err := os.OpenFile(filepath.Join(data, "server.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0600)
		if err != nil { return err }
		cmd := exec.Command(node, server)
		cmd.Dir = root
		cmd.Stdout, cmd.Stderr = log, log
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000} // CREATE_NO_WINDOW
		if err := cmd.Start(); err != nil { log.Close(); return fmt.Errorf("could not start local server: %w", err) }
		cmd.Process.Release()
		log.Close()
		for attempt := 0; attempt < 60 && !ready(); attempt++ { time.Sleep(250 * time.Millisecond) }
		if !ready() { return fmt.Errorf("the local server did not become ready; see data\\server.log") }
	}
	url := baseURL + "/" + surface + "/"
	if err := exec.Command("rundll32.exe", "url.dll,FileProtocolHandler", url).Start(); err != nil {
		return fmt.Errorf("open this address in your browser: %s (%w)", url, err)
	}
	return nil
}

func ready() bool {
	client := http.Client{Timeout: 500 * time.Millisecond}
	response, err := client.Get(baseURL + "/api/health")
	if err != nil { return false }
	defer response.Body.Close()
	var health struct { OK bool `json:"ok"`; App string `json:"app"` }
	return response.StatusCode == http.StatusOK && json.NewDecoder(response.Body).Decode(&health) == nil && health.OK && health.App == "MEDMIND"
}

func message(title, content string) {
	user32 := syscall.NewLazyDLL("user32.dll")
	show := user32.NewProc("MessageBoxW")
	toUTF16 := func(value string) uintptr { pointer, _ := syscall.UTF16PtrFromString(value); return uintptr(unsafe.Pointer(pointer)) }
	show.Call(0, toUTF16(content), toUTF16(title), 0x10)
}
