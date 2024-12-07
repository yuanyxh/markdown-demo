# Crash Course Computer Science

## 计算机早期历史

```
const value = "哎呦我干嘛哈哈哈";
```

    const value = "哎呦你干嘛哈哈";

讲解计算机历史，早期出现的计算工具：

- 算盘
- 步进计算机
- 差分器
- 分析机
- 打孔卡片制表机

~~部分计算需要长时间计算辅以 **表** 完成，每次设备改进 **表** 需要重新制作，不方便。~~

[**_heihei_**](https://yuanyxh.com)

[link](/uri)

## 电子计算机

讲解电子计算机的出现，以及控制运算开关的元器件的发展，主要有：

- 继电器（效率低，易磨损）
- 真空管（效率中，易磨损）
- 晶体管（效率高，不易磨损，体积小，使用半导体控制电流通过）

## 布尔门与逻辑门

讲解电子计算机是如何通过晶体管完成逻辑判断的，逻辑判断有：

- and：输入都为真输出为真
- or：输入有一个为真输出为真
- not：反转输入结果，输入为真输出为假
- xor：输入相同输入为假，输入不同输出为真

## 二进制

每一位是上一位的两倍，最后的结果相加则为十进制：

![](http://qkc148.bvimg.com/18470/02d6c3078ea53535.png)

- 一位二进制数是一位（bits），8 位二进制数为一字节（bytes）
- 32 位电脑表示一次能处理 32 位数量级的数据
- 大部分计算机以第一位二进制数判断正负：1 为负 0 为正
- 计算机给内存中的每一位做了标记，称为 **位址**

浮点数：通常使用 **IEEE 754** 标准表示浮点数

```js
652.9 === 0.6529 x 10^3
// 0.6529 是有效位数
// 3 是指数
```

32 位浮点数中，第一位表示正负，后 8 位存放指数，剩下 23 位存放有效位数。
ASCII 码，以 7 位二进制数表示，每一位表示 数字、大小写字母、部分字符
Unicode 码，以 16 位二进制数表示，表示数字、大小写字母、绝大部分国家的文字、符号、emoji

## 算数逻辑单元（ALU）

**ALU** 是计算机中负责计算的组件，它有两个单元：算数单元与逻辑单元。

#### 算数单元

算数单元负责所有数学计算

- 半加器：xor 运算能处理 1 + 0、0 + 0、0 + 1，但无法处理 1 + 1，因为二进制中没有 2，所以需要和 and 组合，只有输入都为 1 时 and 为 1，于是结果为二进制 10，即十进制中的 2，这样的组合称为 **半加器**。
- 全加器：a 和 b 通过半加器得到输出 1，输出 1 再和 c 通过半加器得到输出 2，输出 1 和输出 2 通过 or 得到进位。

能处理 8 位加法的单元叫做 `8 位行波进位加法器`, 当能处理的最大位数执行加法操作后仍有进位，则称为 `overflow` （溢出）。
现代计算机使用的加法电路是 `超前进位加法器`。

#### 逻辑单元

逻辑单元执行所有逻辑运算

<video src="./videos/科学速成课_算数逻辑单元.mp4"></video>

8 位 **ALU** 接受两个 8 位输入，以及一个 4 位操作码，得到 8 位输出，同时输出一些 1 位标志位表示特定状态；

比如 1 - 1 = 0，此时零测试电路会将 `ZERO` 标准位设为 `True`；或者 a - b，如果结果为负数则将负标志（`NEGATIVE`）设为 `True`；如果有溢出，则将 `OVERFLOW` 标志设为 `True`；高级 `ALU` 有更多标志。

## 寄存器 & 内存

电脑使用 `随机存取存储器`(RAM)，在通电情况下才能存取数据。

#### AND - OR 锁存器

使用 or 门获得输出，输出结果再回传至其中一个输入，只要输入都不为 0，则它能存储 1；使用 and 门获得输出，输出结果再回传至其中一个输入，只要输入都不为 1，则它能存储 0；两者结合则为锁存器。

<u>AND - OR 锁存器</u> 有 `设置` 与 `复位` 两个输入，`设置` 输入将输出变为 1，`复位` 输入将输出变为 0；如果两者都设置为 0 则锁存器输出最后存放的内容。
**_锁存器_** 能够存储一位的数据。

#### 门锁

给锁存器加入门锁，一个数据输入线，一个允许写入线；只有允许写入线开启时(数据为 1)，数据输入才能通过。

#### 寄存器

多个锁存器 **_并列排放_** 组成一个寄存器，早期电脑 8 个（8 位）锁存器为一组；寄存器能够存储一个数字，这个数字有多少位称为 **_位宽_**。
寄存器写入数据前需要开启其中所有锁存器的允许写入线。

#### RAM

**_并列排放_** 锁存器以组成寄存器需要很多的数据输入线与一个允许写入线，所以采用 **_矩阵排放_** 的方式摆放锁存器，
要启用某个锁存器则打开对应的行线与列线：

![image-20230310210117139](http://qkc148.bvimg.com/18470/166e940bdcb77348.png)

只有行线、列线与允许写入线都为 1 时才允许写入数据，每次只有一个锁存器允许被操作，所以只需要一个数据写入线用于存储数据。

#### 多路复用器

一个多路复用器用于处理行，一个多路复用器用于处理列；接收二进制数据输入以选择对应的行和列。

## 中央处理器(CPU)

#### 指令

计算机通过指令执行操作，指令指示计算机需要做什么。以 8 位指令为例，前 4 位指示进行什么操作（opcode），后四位指示数据来源于哪里（地址 or 寄存器，可以是内存或寄存器）。

#### 寄存器

寄存器其中两个类别：

- 指令地址寄存器，用于跟踪程序运行到什么地方，存储当前指令的地址
- 指令寄存器，存储当前指令

#### 代码执行

当计算机启动时，所有寄存器从 0 开始，以 <u>LOAD_A</u> 指令为例，程序运行经过几个阶段：

1. 取指令阶段，负责读取指令
   - 将指令地址寄存器连接到 RAM，获取到地址 0 处的指令并赋值给指令寄存器
2. 解码阶段
   - 解码指令，获取其中的操作码（ opcode），假设操作码为 <u>LOAD\*A</u>，意为将指令中数据地址处的数据赋值给 <u>寄存器 A</u>；指令由 \*\*\*控制单元\_\*\* 解码，控制单元也是由逻辑门组成的。
3. 执行阶段
   - 使用检查对应指令（LOAD_A）的电路打开 <u>RAM</u> 的允许写入线并将指令中数据地址传递过去，<u>RAM</u> 连接到所有的寄存器，检查对应指令的电路会打开目标寄存器的允许写入线，将数据写入到目标寄存器。
   - 操作完成关闭所有的线，将指令地址寄存器 + 1，读取下一条指令。

#### 结合 ALU

控制单元控制对应寄存器的值作为 ALU 的输入，同时传递操作码，经过 ALU 得到输出后，将结果临时保存至控制单元的一个寄存器，关闭 ALU，然后再将数据赋值给目标寄存器。

#### 时钟

CPU 的执行由 **_时钟_** 调度，CPU <u>读取 -- 解析 -- 执行</u> 的速度称为 **_时钟速度_**。

- 超频 - 加快时钟频率，提升性能
- 降频 - 减缓时钟频率，提升续航

大部分现代计算机可根据需求加快或减缓时钟速度，称为 **_动态调整频率_**。
时钟单位为 **_赫兹_**。

## 指令和程序

- **_JUMP 指令指示程序跳转至对应地址，它是通过指令中表示地址的数据覆盖掉指令地址寄存器以达到跳转的目的_**
- **_HALT 指令指示程序应结束运行_**

#### 指令长度

假设 CPU 使用 8 位指令，4 位表示操作码，4 位表示地址或寄存器，则最多能表示 16 个指令与 16 个地址。

#### 可变指令长度

假设 CPU 使用 8 位指令，读取 <u>HALT</u> 指令，不需要额外数据，会立即执行；读取 <u>JUMP</u> 指令，需要地址数据，数据称为 **_立即值_**。这样操作指令长度可以是任意的。

## 高级 CPU 设计

- **_现代处理器有专门的电路处理复杂操作，比如图形操作、解码压缩视频、加密文档等_**

<u>RAM</u> 是 <u>CPU</u> 之外的独立组件，数据需要通过线来传输，称为 **_总线_**。
<u>CPU</u> 的执行速度远远大于从 <u>RAM</u> 获取数据的速度，<u>CPU</u> 等待数据会造成性能浪费。

#### 缓存

在 <u>CPU</u> 中加入一点 <u>RAM</u>，称为 **_缓存_**，从 <u>RAM</u> 读取数据时读取一大段数据，存储至缓存，当数据存在于缓存中时，<u>CPU</u> 直接从缓存读取数据，这称为 **_缓存命中_**，反之称为 **_缓存未命中_**。

##### 脏位

<u>CPU</u> 存储数据时，依然存储至缓存，但会导致缓存与 <u>RAM</u> 数据不一致，因此需要记录不一致以待后续同步。
缓存里的每一个空间都有一个标记，称为 **_脏位_**。

##### 同步

同步一般发生在缓存空间已满但仍有数据需要存储至缓冲区时，先检查缓存空间的脏位，如果数据是脏的，在加载新内容前需要将数据写入到 <u>RAM</u>。

#### 指令流水线

指令 <u>读取 -- 解析 -- 执行</u> 分别由三个不同的组件完成，意味着可以 **_并行_** 执行。

1. 执行当前指令的时候解析下一条指令
2. 执行当前指令的时候读取下下一条指令

这种方式需要搞清楚指令的依赖性，必要时停止流水线，防止数据出现问题，高端 <u>CPU</u> 会 **_动态排序_** 有依赖关系的指令，最小化流水线的停工时间，这称为 **_乱序执行_**。

流水线还需要处理 <u>JUMP</u> 指令，一般浏览器会停下来等待跳转地址确认下来，高端浏览器会猜测具体走哪条分支，这称为 **_推测执行_**；推测正确则继续执行，错误则清空流水线。

<u>CPU</u> 厂商为了提高准确性，采用了复杂的方式猜测正确的分支，这称为 **_分支预测_**。

#### 多核与多 CPU

- 多核 -- <u>CPU</u> 里存在多个相同的独立处理单元

每秒执行多少次浮点数运算被称为 **_每秒浮点运算次数（FLOPS）_**。

## 早期的编程方式

早期以插孔面板、插板、打孔纸片存储程序与数据。

- 插孔面板 -- 不同的方式将插孔接入电线以完成不同的程序（费时）
- 可拔插插孔面板 -- 程序与数据存储在插板中，每个插板是一个程序（费时）
- 穿孔卡纸 -- 程序与数据存储在穿孔卡纸中，机器录入纸片信息以完成编程（一个卡纸所能存储的指令有限，一个简单程序可能需要上百张打孔纸片）
- 面板 -- 计算机面板上存在大量开关，通过这些开关录入程序与数据。

## 编程语言发展史

**_汇编器_** 将 **_助记符_** 转换为对应的 **_机器码_**。

**_编译器_** 将 **_高级语言_** 转换为 **_低级语言_**。

**_neglect 5_**

## 集成电路 & 摩尔定律

将多个组件组合形成新的独立组件，称为 **_集成电路（IC）_**。

多个组件仍需连接组合成更大的部分，利用 **_印刷电路版（PCB）_**，使用 <u>蚀刻金属线</u> 代替电线将各个部件连接到一起。

使用 <u>光刻</u> 在 **_晶圆（硅）_** 中刻上复杂金属电路，集成所有组件。

## 操作系统

**_操作系统_** 提供 <u>API</u> 抽象硬件，称为 **_设备驱动程序_**。

#### 多任务处理

<u>I/O 任务</u> 较为耗时，空等完成浪费 <u>CPU</u> 资源，操作系统在 <u>I/O 任务</u> 开始时将程序休眠，执行其他任务，<u>I/O 任务</u> 完成时会通知操作系统可以继续执行；这被称为 **_多任务处理_**。

多任务处理意味着各个程序之间需要不同的内存保存数据，操作系统会分配不同的专属程序空间，当程序申请更多内存空间时操作系统会决定是否同意。

申请更多空间可能导致内存空间不连续，为了隐藏这种复杂性，操作系统将内存地址虚拟化，称为 **_虚拟内存_**，程序假定内存地址总是从 0 开始，实际物理内存地址被操作系统抽象隐藏。

这些操作使得程序的内存大下可以灵活增减，被称为 **_动态内存分配_**。

每个程序分配专属的内存空间，一个程序出错不会影响到其他程序，被称为 **_内存保护_**。

#### 分时操作系统

早期计算机可能有多个终端供多个用户使用，操作系统需要区分不同用户分配资源，限制每个用户只能用一部分的处理器与内存，这叫 **_分时操作系统_**。

#### UNIX

<u>UNIX</u> 将操作系统分为两部分：

- 内核：内存管理、多任务处理、I/O 输入输出等
- 程序、库等

## 内存 & 储存介质

**_存储器_** 中的数据是永久存储的，除非被覆盖或删除，存储器是 **_非易失性的_**。

存储介质发展：打孔卡纸 -- 打孔纸带 -- 延迟线存储器 -- 磁芯存储器 -- 磁带 -- 磁鼓存储器 -- 磁盘 -- 硬盘、软盘 -- 光盘 -- 固态硬盘（SSD）

存储器访问任意数据所需的时间称为 **_寻道时间_**。

## 文件系统

文件按格式存储，称为 **_文件格式_**。

<u>TXT</u> 文件存储文字，文字内容以 <u>ASCII</u> 解码对应二进制数据。

需要知道按什么方式解码复杂文件，这些信息存储在文件头（Header，或称 **_元数据_**）中。

#### 平面文件系统

存储器存储多个文件时，有一个默认文件（称为 **_目录_**），<u>目录</u> 记录所有文件名，以及文件的元数据（创建时间、最后修改时间，文件所有者，读写权限等），同时记录文件的起始位置与长度。

#### 现代文件系统

现代文件系统会将存储区域划分为一块块，留有空余空间，方便文件修改，同时拆分文件存储至多个块中，文件系统会记录这些块。

删除文件时会删掉对应的块记录，数据仍然存在，等待新的数据覆盖，这意味着数据未被覆盖时可以被恢复。

文件被分割在多个块中，这称为 **_碎片_**，计算机会将碎片整理为连续的块，这称为 **_碎片整理_**。

#### 分层文件系统

分层文件系统不仅要区分不同的文件，也需要区分不同的目录，需要额外的元数据区分是文件还是目录。

## 压缩

压缩文件，用更少的 bits 来存储文件。

#### 游程编码

适用于存在大量重复数据的文件，将重复数据删除，通过元数据告诉计算机这里有多个相同数据以解压缩，这种压缩方式是 **_无损压缩_**，数据没有丢失，只是换了一种方式表示。

#### 字典编码

将文件数据按一定算法生成字典，字段中的一个字段对应特定的数据，将数据替换为字段，完成映射，这也是 <u>无损压缩</u>。

#### 感知编码

通过删除人类无法感知或感知不明显的 bits 位以完成压缩，这称为 **_有损压缩_**。

#### 视频压缩

视频是一张张图片，可以采用感知编码的方式压缩视频，通常只存视频中有变化的部分，这称之为 **_时间冗余_**。

高级视频压缩格式会找出帧与帧之间相似的补丁，通过简单效果实现。

## 命令行界面

早期输入方式：电线 -- 插板 -- 打孔纸板 -- 键盘

#### 电传交互界面

用户输入命令，计算机通过 <u>电传打字机</u> 输出，这叫 **_命令行界面_**。

#### 终端

使用屏幕代替 <u>电传打字机</u>，沿用 <u>电传打字机</u> 的协议，输出由 <u>电传打字机</u> 打印变为屏幕输出，这称为 **_终端_**。

## 屏幕 & 2D 图形显示

#### 显示技术

**_阴极射线管（CRT）_**，将电子发射到有磷光体涂层的屏幕上，电子撞击涂层时屏幕会短暂发光，电子是带电粒子，可以使用磁场控制路径以描绘图案。

#### 矢量扫描

不断重复引导电子束描绘出图案。

#### 光栅扫描

从上到下从左到右不断重复，只在特定的点打开电子束描绘图案。

#### 字符生成器

**_字符生成器_** 内部有一块存储器，称为 **_ROM_**，存储字符图案，称为 **_点阵图案_**。

图形卡发现数据是一个字符图案时会将它的 <u>点阵图案</u> 光栅扫描到屏幕的适当位置。

<u>字符生成器</u> 会访问内存中专为图形保留的特殊区域，称为 **_屏幕缓冲区_**，当修改其中的值时，屏幕显示也同时改变。

#### 矢量绘图

<u>屏幕缓冲区</u> 存储 **_矢量指令_**，**_矢量图形卡_** 将指令描述的图形绘制到屏幕，通过不断更新指令可以做到 **_动画_**。

#### 位图显示

bits 对应屏幕上的像素，像素数据存储在内存的特殊区域 ，被称为 **_帧缓冲区_**。

早期像素数据存储在内存中，现在存在 **_高速视频内存（VRAM）_** 中；<u>VRAM</u> 在显卡中，访问更快。

**_neglect 1_**

## 个人计算机革命

**_解释器（interpreter）_**，在运行时将高级语言转换为低级语言。

**_neglect 1_**

## 3D 图形

**_3D 投影_** 将 3D 图形经过算法转换为 2D 平面上的点，通过绘制线段的函数连接这些点，这称为 **_线框渲染_**。

<u>线框渲染后</u> 需要填充线框中的空白部分，这种算法被称为 **_扫描线渲染_**，填充速度被称为 **_fillrate（填充速率）_**。

这种方式绘制的图形边缘会有锯齿，**_抗锯齿_** 将图形边缘的像素羽化，显示会更平和。

## 计算机网络

计算机近距离构成的小型网络被称为 **_局域网（LAN）_**。

#### 以太网

**_以太网_**：使用 <u>以太网</u> 电缆连接多个电脑，传输数据时将数据以电信号的形式发送，为了知道数据的传输目标，每个计算机有一个唯一的媒体访问控制地址，称为 **_MAC 地址_**；这个地址放在数据头部，计算机只有看到自己的 <u>MAC</u> 地址才会处理数据。

多个计算机共享一个传输媒介，被称为 **_载波侦听多路访问（CSMA）_**，媒介载体的传播速度被称为 **_带宽_**。

多个计算机同时传输大量数据时，数据可能会混乱，计算机在检测到数据混乱时会暂停一段 **随机时间** ，然后再次重传；如果重传依然冲突时，会暂停：固定时间 ** 尝试次数 + 随机事件；这种指数增长等待事件的方式称为 \***指数退避\*\*\*。

为了效率与减少冲突，需要减少同一载体中的设备数量，载体和其中的设备总称为 **_冲突域_**。

#### 交换机

一个冲突域中使用交换机再次划分为多个区域，假设为区域 A、区域 B；如果区域 A 中的设备需要传输数据至区域 A 中的其他设备，此时区域 B 中的通道依然是空闲的；如果区域 A 中的设备需要传输数据至 区别 B 中的设备，此时整个通道都被占用。

#### 电路交换

分配一条专属通信线路连接两台相隔遥远的计算机或网络，如果线路被占需要等待空闲时操作，这被称为 **_电路交换_**。

#### 报文交换

数据经由多个中转站（**_路由_**），站点知道下一站应该去往哪里，当某一站出现问题时会改变路线。

消息沿着路由跳转的次数被称为 **_跳数_**；当 <u>跳数</u> 过高时可以知道出现了问题，这被称为 **_跳数限制_**。

当报文太大时会堵塞整个网络，为了解决，将大的报文分隔成多个小块，被称为 **_数据包_**。

<u>数据包</u> 携带着目标地址，报文具体格式由 **_互联网协议（IP）_** 定义，每台联网的计算机都有一个 <u>IP</u> 地址。

路由器会平衡与其他路由器之间的负载，这被称为 **_阻塞控制_**。

大报文分割成多个数据包时，多个数据包可能会经过不同的路由，导致数据到达的顺序不正确。

## 互联网

访问数据时，计算机连接至局域网，局域网连接至 **_广域网（WAN）_**，广域网中，先连接至区域性路由器，再连接至更大的广域网，最终连接至互联网主干，再从互联网主干连接至目标服务器以访问资源。

#### UDP

最底层的 **_IP_** 协议，数据中只存在目标地址的信息，计算机无法知道数据具体交给哪个程序，因此需要构建上层协议。

**_用户数据报协议（UDP）_**在数据前面包含元数据，元数据中存在 **_端口_** 信息，每个想要访问网络的程序需要向操作系统申请一个端口。

元数据中还存在 **_校验和_**，用于校验数据是否正确，将所有数据相加得到 <u>校验和</u>，<u>校验和</u> 以 16 位形式存储，当结果超过所能表示的最大值时会舍弃高位保留低位。

<u>UPD</u> 不提供数据重传与恢复机制，也无法知道数据是否成功到达。

#### TCP

**_传输控制协议（TCP）_** 的元数据同样存在端口与校验和，同时给每个数据包标记序号以保证数据的顺序。

<u>TCP</u> 要求接收方在收到数据且校验成功后给发送方一个 **_确认码（ACK）_**，然后发送下一个数据包，如果发送方没有收到 <u>ACK</u>，会尝试重新发送。

<u>TCP</u> 可以同时发送多个数据包， <u>ACK</u> 的成功率与传输时间可用于推算网络拥堵，<u>TCP</u> 根据拥堵情况调整同时发包数量。

#### 域名系统（DNS）

访问网站时需要 IP 地址 + 端口号，<u>DNS</u> 负责将域名与 IP 地址 一一对应。
<u>DNS</u> 服务器存储这些映射关系，访问域名时会首先去对应的 <u>DNS</u> 服务器查询对应的 IP 地址。
<u>DNS</u> 服务器以树结构存储域名，顶级域名如：

- .com
- .gov

二级域名如：

- youtube.com
- google.com

子域名如：

- images.google.com

**_neglect 11_**

<table>
  <colgroup>
    <col style="width: 30px" />
    <col style="width: 100px" />
    <col style="width: 100px" />
    <col style="width: 100px" />
    <col style="width: 100px" />
  </colgroup>
  <thead>
    <tr>
      <th>1</th>
      <th>2</th>
      <th>3</th>
      <th>4</th>
      <th>5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>2</td>
      <td>3</td>
      <td>4</td>
      <td>5</td>
    </tr>
  </tbody>
</table>
