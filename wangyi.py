import random

from selenium import webdriver
import time


mark = input("Mark:")

print("----------------------------")
print("根据分析，为您推荐到歌曲类型为："+mark+"\n")
print("正在为您加载歌曲........")
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

print("正在为您播放音乐.....")
url = []
for i in id:
    url.append('http://music.163.com/song/media/outer/url?id=' +i+'.mp3')

for i in url:
    print(i)

id = listurl[36:]
print("正在为您生成iframe代码：")
print("<iframe frameborder='no' border='0' marginwidth='0' marginheight='0' width=330 height=450 src='http://music.163.com/outchain/player?type=0&id="+str(id)+"&auto=1&height=430'></iframe>")






