# V6 深色观星台

内部六个入口、兴趣设置、表单、弹窗和私人知识状态统一使用黑蓝底色；七色保留为知识领域标记。星图与观星台保留坐标、轨道和星群连接。

首页火星改为 Canvas 2D 球面投影渲染，使用 Viking 的 1440×720 经纬贴图，地表经度持续变化，约100秒完成一周，光照方向固定。页面隐藏或星球离开视口时暂停，返回继续；系统或账户减少动态时显示静止球面。Canvas 或贴图不可用时回退为原静态图片。无需 WebGL 或独立显卡。

贴图来源：NASA/JPL/USGS，Solar System Simulator，https://space.jpl.nasa.gov/tmaps/mars.html ，https://space.jpl.nasa.gov/tmaps/pix/mar0kuu2.jpg 。

主页入口顺序、中英文切换、粒子技能交互及原有业务功能保留。
