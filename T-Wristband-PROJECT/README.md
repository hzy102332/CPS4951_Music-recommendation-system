# Introduction of Program Upload (Hardware Related) of Our Project
**TO ENSURE THAT EVERYTHING WORKS CORRECTLY, PLEASE STRICTYLY FOLLOW THE FOLLOWING STEPS:**
1. **How to input program into the hardware (esp32)?**
+ You need download Arduino IDE as the platform to input a program into a hardware (Refer to: [link](https://www.arduino.cc/en/software)).
+ In this project, we used LILYGO T-Wristband ESP32 MPU9250 [H393-06] and L821 Heart Rate Accessories as the hardware to input T-Wristband-MAX3010X heartbeat program. Product [link](https://m.tb.cn/h.fK4waSF?tk=RfcG26ZdBDi).
+ After installing Arduino and having a piece of corresponding hardware, you need to deploy ESP32 development environment in Arduino. The details can be found in [link](https://blog.csdn.net/qq_36332757/article/details/106397455).
+ After finished the above steps, you need to connect your T-Wristband to the computer through ESP32 development board. Show in the picture:
![](images/1.png)
+ Open your program (.ino file), click "verify" ("验证") ![](images/2.png)to test your program. If the program has no errors, then it should be like this: ![](images/3.png)
+ Then, you can upload your program to the board. Click "upload"("上传")![](images/4.png) . If the program has been uploaded succesfully, then it should be like this: ![](images/5.png) **Do not worry about the warning in the bottom!**
+ OK, you can enjoy the funny of your program!**NOTICE:** When you testing your program on your hardware, if you encounter any problems, please try restarting first! Press the botton showed in the picture! ![](images/6.png) More details can be found in the video BV12V411R7EL (Bilibili.com).
 
2.	**Where to find the corresponding heartbeat program (MAX3010X)?**
Refer to [link](https://github.com/Xinyuan-LilyGO/LilyGo-T-Wristband)
+ You can find the program in "examples", but FIRST CLONE THE CODE INTO YOUR COMPUTER.
If you do not know how to clone the code, please refer to the video BV12V411R7EL or you can find some step-by-step introduction on the Internet (it is easy).
3.	**How to set ESP32 as a BLE Server?**  Refer to [link](https://randomnerdtutorials.com/esp32-bluetooth-low-energy-ble-arduino-ide/)
+ More knowledge about BLE can be found in this website. You can find how to receive data in your smart phone in this website as well.
4.	**How to connect BLE Server program and T-Wristband MAX3010X program (or how to bundle some programs and upload them to the board)?**
+ Since Arduino can only allow you to upload ONE program in one "upload", so you need to connect your programs together into one .ino file. The simplest way is to put void setup() together and put void loop() together. However, you need to test and debug after you putting these programs together.
The BLE with BPM program has been upload [BPM_WITH_BLE.txt](https://github.com/hzy102332/CPS4951_Music-recommendation-system/blob/main/BPM_WITH_BLE.txt), you can check and do some changes by yourselves.

