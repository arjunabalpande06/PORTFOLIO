Password = input("Enter password: ")

# Conditions
has_upper = False
has_digit = False
has_special = False

special_chars = "!@#$%^&*()_+-="

for ch in Password:
    if ch.isupper():
        has_upper = True
    elif ch.isdigit():
        has_digit = True
    elif ch in special_chars:
        has_special = True

# Check strength
if len(Password) >= 8 and has_upper and has_digit and has_special:
    print("Strong Password")
else:
    print("Weak Password")