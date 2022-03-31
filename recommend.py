import math
import time
import matplotlib.pyplot as plt

'''
This fule only to show how recommend works
YOU DO NOT HAVE PUT IT INTO THE COMPLETE PROJECT
Problem? try to find Maverick and ask him XD
'''

# time.localtime().tm_hour
'''
Function: Base on the state, bpm of user and current time (hour), recommend music types
Parameters: 
    place: state of the user 
    heart_beat: bpm of the user
    t: current time (hour)
'''


def recommend(place, heart_beat, t):
    # initial parameters
    place_list = {"home": 14, "work": 17, "sleep": 20, "sport": 6}
    music_list = {0: "摇滚", 1: "金属", 2: "说唱", 3: "流行", 4: "爵士", 5: "R&B", 6: "民谣", 7: "蓝调", 8: "古典"}

    # calm weight
    weight = sigmoid(time_function(t) * place_list[place] / heart_beat)

    # wipe out the extreme values
    if weight < 0.57:
        return "摇滚"
    elif weight > 0.97:
        return "古典"
    weight = int((weight - 0.52) / 0.05)
    return music_list[weight]


"""
time function makes the time grows on both sides with 12 as the center
"""


def time_function(time):
    time_fit = abs(time - 12) + 1
    return time_fit


"""
Sigmoid activator used to normalize and de linearize the output weight
"""


def sigmoid(x):
    x = 1 / (1 + math.exp(-x))
    return x


if __name__ == "__main__":
    print("work, hb:72, time: 19")
    print(recommend("work", 72, 19))
    print("-----------")
    print("sleep, hb:60, time: 23")
    print(recommend("sleep", 60, 23))
    print("-----------")
    print("home, hb:69, time: 10")
    print(recommend("home", 69, 10))
    print("-----------")
    print("sport, hb:110, time: 13")
    print(recommend("sport", 110, 13))
    print("-----------")
