print("NUMBER GUESSING GAME")

import random
num = random.randint(1,100)
counts = 0

while True:
    a = int(input("Guess the number: "))
    counts += 1

    if(a > num):
        print("Too High")
    elif(a < num):
        print("Too Low")
    else:
        print("Correct guess")
        print(f"Total attempts are : {counts}")
        break