import random
import pymysql
from selenium import webdriver
import pandas as pd
import time
import math
import time
import matplotlib.pyplot as plt


# time.localtime().tm_hour
def recommand(place, heart_beat, t):
    place_list = {"home": 14, "work": 17, "sleep": 20, "sport": 6}
    music_list = {0: "摇滚", 1: "金属", 2: "说唱", 3: "流行", 4: "爵士", 5: "R&B", 6: "民谣", 7: "蓝调", 8: "古典"}

    weight = sigmoid(time_function(t) * place_list[place] / heart_beat)

    if weight < 0.57:
        return "摇滚"
    elif weight > 0.97:
        return "古典"
    weight = int((weight - 0.52) / 0.05)
    return music_list[weight]


def time_function(time):
    time_fit = abs(time - 12) + 1
    return time_fit


def sigmoid(x):
    x = 1 / (1 + math.exp(-x))
    return x


#获取心率
print("begin")
conn = pymysql.connect(host="sh-cynosdbmysql-grp-eeizn9m8.sql.tencentcdb.com",
                       port=29917,
                       user="root",
                       password="cps4951!",
                       db="cps4951",
                       charset="utf8")

cursor = conn.cursor()
sql = "SELECT * FROM cps4951.heart_beat;"
data_frame1 = pd.read_sql(sql, conn)
print("data_frame1")
print(data_frame1)
print(int(data_frame1['bpm'].values[0]))
#这里会打印出来一个data frame格式的数据，你应该看了就知道怎么用了
#这一块是你需要改的
# print("work, hb:72, time: 19")
print(recommand("work", int(data_frame1['bpm'].values[0]), time.localtime().tm_hour))
# print("-----------")
# print("sleep, hb:60, time: 23")
# print(recommand("sleep", 60, 23))
# print("-----------")
# print("home, hb:69, time: 10")
# print(recommand("home", 69, 10))
# print("-----------")
# print("sport, hb:110, time: 13")
# print(recommand("sport", 110, 13))
# print("-----------")
#mark就等于你的返回结果
# mark = input("Mark:")
mark = recommand("work", int(data_frame1['bpm'].values[0]), time.localtime().tm_hour)
print("----------------------------")
print("Based on the analysis, recommend the following song types for you:"+mark+"\n")
print("Loading music........")
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('blink-settings=imagesEnabled=false')
chrome_options.add_argument('--start-maximized')
web = webdriver.Chrome(options=chrome_options)

web.get("https://music.163.com/#/discover/playlist/?cat="+mark)
web.implicitly_wait(10)
iframe = web.find_element_by_xpath("/html/body/iframe[1]")
web.switch_to.frame(iframe)
web.implicitly_wait(10)
num = random.randint(0,35)
web.find_element_by_xpath("//*[@id='m-pl-container']/li["+str(num)+"]/div/a").click()


web.implicitly_wait(10)
listurl = web.current_url
web.get(listurl)
iframe=web.find_element_by_xpath("/html/body/iframe[1]")
web.switch_to.frame(iframe)
list=web.find_elements_by_xpath("/html/body/div[3]/div[1]/div/div/div[2]/div[2]/div/div[1]/table/tbody/tr/td[1]/div/span[1]")

id=[]
for i in list:
    id.append(i.get_attribute("data-res-id"))

print("Playing music.....")
url = []
for i in id:
    url.append('http://music.163.com/song/media/outer/url?id=' +i+'.mp3')

for i in url:
    print(i)

id = listurl[36:]
print("Cearting iframe code......: ")
frame="<iframe frameborder='no' border='0' marginwidth='0' marginheight='0' width=330 height=450 src='http://music.163.com/outchain/player?type=0&id="+str(id)+"&auto=1&height=430'></iframe>"
print(frame)


#更新iframe
sql="update iframe set iframe = frame"
cursor.close()



