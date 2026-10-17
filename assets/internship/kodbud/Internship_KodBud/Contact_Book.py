contacts = []

def add_contact():
    name = input("Enter name: ")
    phone = input("Enter phone: ")
    contacts.append({"name": name, "phone": phone})
    print("Contact added!")

def view_contacts():
    if not contacts:
        print("No contacts found")
    else:
        for c in contacts:
            print(c["name"], "-", c["phone"])

def search_contact():
    name = input("Enter name to search: ")
    found = False
    for c in contacts:
        if c["name"].lower() == name.lower():
            print("Found:", c["name"], "-", c["phone"])
            found = True
    if not found:
        print("Contact not found")

def delete_contact():
    name = input("Enter name to delete: ")
    for c in contacts:
        if c["name"].lower() == name.lower():
            contacts.remove(c)
            print("Contact deleted")
            return
    print("Contact not found")

while True:
    # print("\n1. Add  2. View  3. Search  4. Delete  5. Exit")
    print("\n1. Add a contact : ")
    print("\n2. View contact book : ")
    print("\n3. Search in contact book : ")
    print("\n4. Delete a contact : ")
    print("\n5. Exit : ")

    choice = input("Enter choice (1 - 5) : ")

    if choice == '1':
        add_contact()
    elif choice == '2':
        view_contacts()
    elif choice == '3':
        search_contact()
    elif choice == '4':
        delete_contact()
    elif choice == '5':
        break
    else:
        print("Invalid choice")