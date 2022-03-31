/**
 * @author Toning
 * @Description: html+ 串口蓝牙操作
 * @date 2019/4/10
 */
var BluetoothAdapter = null;
var Intent = null;
var IntentFilter = null;
var BluetoothDevice = null;
var UUID = null;
var Toast = null;

var invoke = null;
var btAdapter = null;
var activity = null;
var MY_UUID = null;

var device = null;
var btSocket = null;

var btFindReceiver = null; //蓝牙搜索广播接收器
var btStatusReceiver = null; //蓝牙状态监听广播
var flag = false; //是否已连接设备
// 蓝牙设备mac地址
var deviceId = null;
// 蓝牙服务ID
var serviceId = null;
// 蓝牙服务特征值ID
var characteristicId = null;
var resultStr = [];
var a=0;

var monitorIntervals = [];// 定时器

var periodRead; // 定时读取器

// 扩展API加载完毕，现在可以正常调用扩展API
function onPlusReady() {
    BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter"); //本地的蓝牙适配器
    Intent = plus.android.importClass("android.content.Intent"); //用于应用间的交互和通讯
    IntentFilter = plus.android.importClass("android.content.IntentFilter"); //愿意接收什么样的 Intent 对象
    BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice"); //远程蓝牙设备
    UUID = plus.android.importClass("java.util.UUID"); //唯一识别码
    Toast = plus.android.importClass("android.widget.Toast"); //一种提供给用户简洁信息的视图

    invoke = plus.android.invoke; //调用
    btAdapter = BluetoothAdapter.getDefaultAdapter(); //获取远程蓝牙设备
    activity = plus.android.runtimeMainActivity(); //启用原生activity
    MY_UUID = UUID.fromString("0000ffe0-0000-1000-8000-00805f9b34fb"); //连接串口设备的 UUID


    for (var i = 0; i < monitorIntervals.length; i++) {//清空旧的定时器
        if (typeof monitorIntervals[i] !== 'undefined') {
            clearInterval(monitorIntervals[i]);
        }
    }
    // 创建定时器  定时刷新数据
    var monitorInterval = setInterval("bluetoothInit()", 5000);
    // 定时器放到全局变量中 用于取消定时器
    monitorIntervals.push(monitorInterval);
}

// 蓝牙设备mac地址
// var deviceId = 'ED:F5:E8:F4:E1:DA';

// 蓝牙服务ID
// var serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB';
// 蓝牙服务特征值ID
// var characteristicId = '0000FFF1-0000-1000-8000-00805F9B34FB';
// var characteristicId1 = '0000FFF2-0000-1000-8000-00805F9B34FB';

// 蓝牙状态
var state = {
    bluetoothEnable: false, //蓝牙是否开启
    bluetoothState: false, //当前蓝牙状态
    discoveryDeviceState: false, //是否正在搜索蓝牙设备
    readThreadState: false, //数据读取线程状态
    msg: '', //消息
};

/**
 * 初始化蓝牙状态 定时执行
 */
function bluetoothInit() {
    state.bluetoothEnable = isSupportBluetooth();
    plus.bluetooth.getConnectedBluetoothDevices({//是否已连接设备
        success: function (e) {
            if (e.devices[0] != undefined && e.devices[0].deviceId != undefined) {
                state.bluetoothState = true;
            } else {
                state.bluetoothState = false;
            }
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 蓝牙状态赋值
 */
function init() {
    $("#bluetoothEnable").html(JSON.stringify(state.bluetoothEnable));
    $("#bluetoothState").html(JSON.stringify(state.bluetoothState));
    $("#discoveryDeviceState").html(JSON.stringify(state.discoveryDeviceState));
    $("#readThreadState").html(JSON.stringify(state.readThreadState));
    $("#msg").html(state.msg);
}

/**
 * 获取蓝牙的状态
 * @return {boolean} 是否已开启
 */
function isSupportBluetooth() {
    if (btAdapter != null) {
        return btAdapter.isEnabled();
    }
    return false;
}

/**
 * 打开蓝牙
 */
function turnOnBluetooth() {
    if (btAdapter == null) {
        shortToast("没有蓝牙");
        return;
    }
    if (!btAdapter.isEnabled()) {
        if (activity == null) {
            shortToast("未获取到activity");
            return;
        } else {
            var intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            var requestCode = 1;
            activity.startActivityForResult(intent, requestCode);
            state.bluetoothEnable = true;
            init();
            return;
        }
    } else {
        shortToast("蓝牙已经打开");
    }
}

/**
 * 关闭蓝牙
 */
function turnOffBluetooth() {
    flag = false;
    cancelDiscovery(); //停止搜索
    closeBtSocket(); //断开连接设备
    if (btAdapter != null && btAdapter.isEnabled()) {
        btAdapter.disable();
        state.bluetoothEnable = false;
        state.readThreadState = false;
        init();
        shortToast("蓝牙关闭成功");
    } else {
        shortToast("蓝牙已经关闭");
    }
    //清空设备列表
    clearList();
}

/**
 * 初始化蓝牙
 */
function initBluetooth() {
    plus.bluetooth.openBluetoothAdapter({
        success: function (e) {
            state.msg = '初始化成功';
            // console.log('initBluetooth success: ' + JSON.stringify(e));
        },
        fail: function (e) {
            state.msg = '初始化失败';
            // console.log('initBluetooth failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 获取已经配对的设备
 * @returns {Array}
 */
function getPairedDevices() {
    var pairedDevices = [];
    var devicesList = "";
    $("#pairedDevices").html("");

    //蓝牙连接android原生对象，是一个set集合
    var pairedDevicesAndroid = null;
    if (btAdapter != null && btAdapter.isEnabled()) {
        pairedDevicesAndroid = btAdapter.getBondedDevices();
    } else {
        shortToast("蓝牙未开启");
    }

    if (!pairedDevicesAndroid) {
        return pairedDevices;
    }

    //遍历连接设备的set集合，转换为js数组
    var it = invoke(pairedDevicesAndroid, "iterator");
    while (invoke(it, "hasNext")) {
        var devices = invoke(it, "next");
        pairedDevices.push({
            "name": invoke(devices, "getName"),
            "address": invoke(devices, "getAddress")
        });

        var input = "<input type='button' value='连接' onclick='SetconnDevice(\"" + devices.getAddress() + "\")' />";
        devicesList += "<li>名称：" + devices.getName() + "<br> 地址：" + devices.getAddress() + "<br>" + input + "</li>";
    }

    $("#pairedDevices").append(devicesList);
    state.msg = '查询到 ' + pairedDevices.length + ' 台已配对的设备';
    init();
    return pairedDevices;
}

/**
 * 搜索蓝牙设备
 */
function discoveryNewDevice() {
    var newDevice = [];
    $("#newDevices").html("");

    if (btAdapter != null && !btAdapter.isEnabled()) {
        shortToast("未打开蓝牙");
    }

    if (btFindReceiver != null) {
        try {
            activity.unregisterReceiver(btFindReceiver);
        } catch (e) {
            console.error(e);
        }
        btFindReceiver = null;
        cancelDiscovery();
    }
    var Build = plus.android.importClass("android.os.Build");
 
    //6.0以后的如果需要利用本机查找周围的wifi和蓝牙设备, 申请权限
    if (Build.VERSION.SDK_INT >= 6.0) {
		
    }

    btFindReceiver = plus.android.implements("io.dcloud.android.content.BroadcastReceiver", {
        "onReceive": function (context, intent) {
            plus.android.importClass(context);
            plus.android.importClass(intent);
            var action = intent.getAction();

            if (BluetoothDevice.ACTION_FOUND == action) { // 找到设备
                var devices = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                newDevice.push({
                    "name": invoke(devices, "getName"),
                    "address": invoke(devices, "getAddress")
                });
                var input = "<input type='button' value='连接' onclick='SetconnDevice(\"" + devices.getAddress() + "\")' />";
                var newDevicesList = "<li>名称：" + devices.getName() + "<br> 地址：" + devices.getAddress() + "<br>" + input +
                    "</li>";
                $("#newDevices").append(newDevicesList);
            }
            if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED == action) { // 搜索完成
                state.msg = '搜索完成，搜索到 ' + newDevice.length + ' 台蓝牙设备';
                state.discoveryDeviceState = false;
                init();
                //停止搜索
                cancelDiscovery();
            }
        }
    });
    var filter = new IntentFilter();
    filter.addAction(BluetoothDevice.ACTION_FOUND);
    filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
    activity.registerReceiver(btFindReceiver, filter);
    btAdapter.startDiscovery(); //开启搜索

    state.msg = '正在搜索设备...';
    state.discoveryDeviceState = true;
    init();
}

/**
 * 清空设备列表
 */
function clearList() {
    $("#pairedDevices").html("");
    $("#newDevices").html("");
}

/**
 * 根据蓝牙地址，连接设备
 * 如果之前没有配对设备 需要重复执行一次
 * @param address
 */
function SetconnDevice(address) {
	setTimeout(() => {
		connDevice(address)
	}, 1000)
}
function connDevice(address) {
    try {
        device = invoke(btAdapter, "getRemoteDevice", address);
        btSocket = invoke(device, "createRfcommSocketToServiceRecord", MY_UUID);
        //初始化设备
        plus.bluetooth.openBluetoothAdapter({
            success: function (e) {
                /**
                 * 当前设备状态 device.getBondState()
                 * 11 正在配对 BluetoothDevice.BOND_BONDING
                 * 12 完成配对 BluetoothDevice.BOND_BONDED
                 * 10 取消配对 BluetoothDevice.BOND_NONE
                 */
                // if (device.getBondState() == BluetoothDevice.BOND_BONDED) { //完成配对
                    plus.bluetooth.createBLEConnection({
                        deviceId: address,
                        success: function (e) {
                            flag = true;
                            console.log('connDevice success: ' + JSON.stringify(e));
                            shortToast("连接成功");
                            state.msg = '已连接设备';
                            state.bluetoothState = true;
							plus.bluetooth.getConnectedBluetoothDevices({
							    success: function (e) {
									console.info("已连接的设备：" + JSON.stringify(e.devices));
									deviceId = e.devices[0].deviceId;
							    },
							    fail: function (e) {
							        console.log('连接--failed: ' + JSON.stringify(e));
							    },
							    complete: function (e) {
							        init();
							    }
							});
							setTimeout(() => {
								getBLEDeviceServices()
							}, 1000)
                        },
                        fail: function (e) {
                            // console.log('connDevice failed: ' + JSON.stringify(e));
                            shortToast("连接失败");
                            state.msg = '连接失败';
                        },
                        complete: function (e) {
                            init();
                        }
                    });
//                 } else {
//                     // 配对
//                     invoke(device, "createBond");
//                 }
            },
            fail: function (e) {
                shortToast("初始化失败");
            }
        });
    } catch (e) {
        shortToast("连接失败，获取Socket失败！");
    }
}
var bss = [];
//获取已连接设备服务
function getBLEDeviceServices(){
	plus.bluetooth.getBLEDeviceServices({
		deviceId:deviceId,
		success:function(e){
			var services = e.services;
			console.info('get services success: '+services.length);
			for(var i in services){
				console.info(i+': '+JSON.stringify(services[i]));
				bss.push(services[i]);
			}
			if(e.index>0){
				document.getElementById('service').value = serviceId = bss[bss.length-1].uuid;
			}
		},
		fail:function(e){
			console.info('get services failed: '+JSON.stringify(e));
		}
	});
}
//选择服务
function selectService(){
	if(bss.length <= 0){
		shortToast('未获取到有效蓝牙服务!');
		return;
	}
	var bts=[];
	for(var i in bss){
		bts.push({title:bss[i].uuid});
	}
	plus.nativeUI.actionSheet({title:"选择服务",cancel:"取消",buttons:bts}, function(e){
		if(e.index>0){
			document.getElementById('service').value = serviceId = bss[e.index-1].uuid;
			shortToast('选择了服务: "'+serviceId+'"');
			characteristicId=null,document.getElementById('characteristic').value='';
			setTimeout(() => {
				getCharacteristics(serviceId)
			}, 1000)
		}
	});
}
//获取特征值
var bscs = [];
var bscws = [];
function getCharacteristics(serviceId){
	plus.bluetooth.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: serviceId,
		success: function(e){
			bscs = [];
			bscws = [];
			var characteristics = null;
			characteristics = e.characteristics;
			shortToast('获取特征值成功! '+characteristics.length);
			if(characteristics.length>0){
				for(var i in characteristics){
					var characteristic = characteristics[i];
					if(characteristic.properties){
						if(characteristic.properties.read){
							bscs.push(characteristics[i]);
						}
						if(characteristic.properties.write){
							bscws.push(characteristics[i]);
							if(characteristic.properties.notify||characteristic.properties.indicate){
								plus.bluetooth.notifyBLECharacteristicValueChange({	//监听数据变化
									deviceId: deviceId,
									serviceId: serviceId,
									characteristicId: characteristic.uuid,
									success: function(e){
										console.info('notifyBLECharacteristicValueChange '+characteristic.uuid+' success.');
									},
									fail: function(e){
										shortToast('notifyBLECharacteristicValueChange '+characteristic.uuid+' failed! '+JSON.stringify(e));
									}
								});
							}
						}
					}
				}
				if(bscs.length>0){	// 默认选择最后特征值
					document.getElementById('characteristic').value = characteristicId = bscs[bscs.length-1].uuid;
				}
// 				if(bscws.length>0){	// 默认选择最后一个可写特征值
// 					document.getElementById('wcharacteristic').value = wcharacteristicId = bscws[bscws.length-1].uuid;
// 				}
			}else{
				shortToast('获取特征值列表为空?');
			}
		},
		fail: function(e){
			shortToast('获取特征值失败! '+JSON.stringify(e));
		}
	});
}

// 选择特征值(读取) 
function selectCharacteristic(){
	if(bscs.length <= 0){
		shortToast('未获取到有效可读特征值!');
		return;
	}
	var bts=[];
	for(var i in bscs){
		bts.push({title:bscs[i].uuid});
	}
	plus.nativeUI.actionSheet({title:'选择特征值',cancel:'取消',buttons:bts}, function(e){
		if(e.index>0){
			
			document.getElementById('characteristic').value = characteristicId = bscs[e.index-1].uuid;
			shortToast('选择了特征值: "'+characteristicId+'"');
		}
	});
}

/**
 * 已连接的设备
 */
function getConnectedBluetoothDevices() {
    //初始化蓝牙
    initBluetooth();
    plus.bluetooth.getConnectedBluetoothDevices({
        success: function (e) {
            console.info("已连接的设备：" + JSON.stringify(e.devices));
            var name = "[ ]"
            if (e.devices[0] != undefined && e.devices[0].deviceId != undefined) {
                name = e.devices[0].name != undefined ? e.devices[0].name : e.devices[0].deviceId;
                flag = true;
            } else {
                flag = false;
            }
            shortToast("已连接的设备：" + name);
        },
        fail: function (e) {
            console.log('连接--failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 断开连接设备
 */
function disConnDevice() {
    closeBtSocket();
    // 取消配对
    invoke(device, "removeBond");
    flag = false;
    shortToast("已断开连接");
	resultStr=null;
	serviceId=null,document.getElementById('service').value='';
	characteristicId=null,document.getElementById('characteristic').value='';
	bss = [];
	bscs = [];
	bscws = [];
}

/**
 * 断开连接设备
 */
function closeBtSocket() {
    plus.bluetooth.closeBLEConnection({
        deviceId: deviceId,
        success: function (e) {
            flag = false;
            state.bluetoothState = false;
            state.readThreadState = false;
			init();
            console.log('--断开连接成功--');
        },
        fail: function (e) {
            console.log('closeBtSocket--failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 停止搜索
 */
function cancelDiscovery() {
    if (btAdapter.isDiscovering()) {
        btAdapter.cancelDiscovery();
    }
    if (btFindReceiver != null) {
        activity.unregisterReceiver(btFindReceiver);
        btFindReceiver = null;
    }
    console.info("--停止搜索--");
}

/**
 * 发送数据
 */
function onSendData() {
    var sendData = $("#sendData").val();
    //已连接设备
    if (flag) {
        //发送的数据不能为空
        if (sendData !== '') {
            plus.bluetooth.writeBLECharacteristicValue({
                deviceId: deviceId,
                serviceId: serviceId,
                characteristicId: characteristicId,
                value: hex2buffer(sendData),
                success: function (e) {
                    state.msg = '发送成功';
                    console.log('发送数据--success: ' + JSON.stringify(e));
                },
                fail: function (e) {
                    state.msg = '发送失败';
					console.log(serviceId+','+characteristicId);
                    console.log('发送数据--failed: ' + JSON.stringify(e));
                },
                complete: function (e) {
                    init();
                }
            });
        } else {
            shortToast("发送失败");
        }
    } else {
        shortToast("未连接设备");
    }
}


/**
 * 定时监听
 */

function readDataPeriodically() {
	periodRead = self.setInterval("readData()", 1000);
}


/**
 * 启动监听 - 读取数据
 */

function readData() {
    // 启用notify功能
		// plus.bluetooth.notifyBLECharacteristicValueChange({
		// 	state: true,
		// 	deviceId: deviceId,
		// 	serviceId: serviceId,
		// 	characteristicId: characteristicId
		// 	success: function (e) {
		// 		state.readThreadState = true;
		// 		console.log('readData ===== success: ' + JSON.stringify(e));
		// 	},
		// 	fail: function (e) {
		// 		state.readThreadState = false;
		// 		console.log('readData ===== failed: ' + JSON.stringify(e));
		// 	},
		// 	complete: function (e) {
		// 		init();
		// 	}
		// 
		
		
		plus.bluetooth.readBLECharacteristicValue({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId
		})
		


    // 监听低功耗蓝牙设备的特征值变化
	// if(a==0){
		plus.bluetooth.onBLECharacteristicValueChange(function (e) {
			if (e.value != undefined) {
				$("#receiveDataArr").html(buffer2hex(e.value));
				$("#receiveDataStr").html(
			hexCharCodeToStr(buffer2hex(e.value)));
			}
		});
		// a=1;
	// }
}
function stopread(){
	console.log(deviceId+','+serviceId+','+characteristicId);
	plus.bluetooth.notifyBLECharacteristicValueChange({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId,
			state: false,
			success: function (e) {
				state.readThreadState = false;
				periodRead = window.clearInterval(periodRead);
				console.log('停止监听成功');
			},
			fail: function (e) {
				state.readThreadState = true;
				console.log('停止监听失败');
			}, 
			complete: function (e) {
				init();
			}
	});
}

/**
 * 清空接收的数据
 */
function clearData() {
    $("#receiveDataArr").html("");
    $("#receiveDataStr").html("");
	resultStr=[];
}

/**
 * 写入的数据 格式转换
 * @param str
 * @returns 字符串 转 ArrayBuffer
 */
function hex2buffer(str) {
    console.info("写入的数据====" + str);
    //字符串 转 十六进制
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    //十六进制 转 ArrayBuffer
    var buffer = new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    })).buffer;

    return buffer;
}

/**
 * 读取的数据 格式转换
 * @param byte数组
 * @returns {string}
 */
function buffer2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    );
	// console.info(hexArr);
    return hexArr.join('');
}

/**
 * 读取的数据 格式转换
 * @param 对应的string字符串
 * @returns {string}
 */
function hexCharCodeToStr(hexCharCodeStr) {
	// console.log(hexCharCodeStr);
    var trimedStr = hexCharCodeStr.replace(/^\s+|\s+$/g, "");
    var hexCharCodeStr = trimedStr.substr(0, trimedStr.length - 4);
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : hexCharCodeStr;
    //===========
	
    for (var i = 0; i < rawStr.length; i = i + 2) {
        var curCharCode = parseInt(rawStr.substr(i, 2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
    }
    // console.info("读取到的数据====" + JSON.stringify(resultStr));
	resultStr.push('<br/>');
    return resultStr.join("");
}

/**
 * 提示信息
 * @param msg
 */
function shortToast(msg) {
    Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show();
}
