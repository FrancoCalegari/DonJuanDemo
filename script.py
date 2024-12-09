import tkinter as tk
from tkinter import messagebox, filedialog, ttk
import json
import os
from PIL import Image, ImageTk

# Funciones CRUD para manejar el archivo JSON
def load_data():
    try:
        with open("data.json", "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"promos": [], "menu": []}

def save_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file, indent=4)

# Cambia el nombre de la función global a add_item_to_data
def add_item_to_data(data, item_type, name, price, description, photo_name):
    if item_type not in data:
        raise ValueError("Tipo de elemento no válido")
    
    new_item = {
        "name": name,
        "price": price,
        "description": description,
        "photo": photo_name
    }
    
    data[item_type].append(new_item)
    save_data(data)




def delete_item(data, item_type, name):
    if item_type not in ["promos", "menu"]:
        raise ValueError("Tipo de elemento no válido")
    
    for item in data[item_type]:
        if item["name"] == name:
            # Eliminar la imagen
            photo_path = f"./img/Menu/{item['photo']}"
            if os.path.exists(photo_path):
                os.remove(photo_path)  # Eliminar el archivo de imagen
            # Eliminar el elemento
            data[item_type].remove(item)
            save_data(data)
            break



def update_item(self):
    old_name = self.get_selected_item_name()
    name = self.name_entry.get()
    price = self.price_entry.get()
    description = self.description_entry.get()
    item_type = self.item_type_combobox.get()

    if not name or not price or not description:
        messagebox.showerror("Error", "Todos los campos son requeridos")
        return

    photo_name = f"{name.replace(' ', '_').lower()}.png"  # Cambiado a .png
    photo_path = f"./img/Menu/{photo_name}"

    try:
        image = Image.open(self.photo_path)
        image.save(photo_path, "PNG")  # Guardar la imagen como PNG

    except Exception as e:
        messagebox.showerror("Error", f"Error al guardar la imagen: {e}")
        return

    update_item(self.data, item_type, old_name, name, price, description, photo_name)
    messagebox.showinfo("Éxito", "Elemento actualizado exitosamente")
    self.load_item_table()


# Funciones para la interfaz gráfica con Tkinter
class FastFoodApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Gestión de Menú - Fast Food")
        
        self.data = load_data()
        
        self.item_type = "menu"  # Default to menu
        self.selected_item = None
        
        self.create_widgets()

    def create_widgets(self):
        # Selector de tipo (Menú / Promos)
        self.type_selector = tk.Frame(self.root)
        self.type_selector.pack(pady=10)

        self.menu_button = tk.Button(self.type_selector, text="Menú General", command=lambda: self.change_type("menu"))
        self.menu_button.pack(side=tk.LEFT, padx=10)

        self.promo_button = tk.Button(self.type_selector, text="Promociones", command=lambda: self.change_type("promos"))
        self.promo_button.pack(side=tk.LEFT, padx=10)

        # Botón para importar JSON
        self.import_button = tk.Button(self.root, text="Importar JSON", command=self.import_json)
        self.import_button.pack(pady=10)

        # Menú de acciones (Agregar, Modificar, Eliminar)
        self.action_button = tk.Frame(self.root)
        self.action_button.pack(pady=20)

        self.add_button = tk.Button(self.action_button, text="Agregar Elemento", command=self.open_add_popup)
        self.add_button.pack(side=tk.LEFT, padx=10)

        self.update_button = tk.Button(self.action_button, text="Modificar Elemento", command=self.open_update_popup)
        self.update_button.pack(side=tk.LEFT, padx=10)

        self.delete_button = tk.Button(self.action_button, text="Eliminar Elemento", command=self.open_delete_popup)
        self.delete_button.pack(side=tk.LEFT, padx=10)

        # Sección para mostrar los elementos en una tabla
        self.table_frame = tk.Frame(self.root)
        self.table_frame.pack(pady=10)

        self.load_item_table()

    def load_item_table(self):
        # Limpiar la tabla previa
        for widget in self.table_frame.winfo_children():
            widget.destroy()

        # Crear encabezados de la tabla
        self.table = ttk.Treeview(self.table_frame, columns=("Name", "Price", "Description", "Photo"))
        self.table.heading("#1", text="Nombre")
        self.table.heading("#2", text="Precio")
        self.table.heading("#3", text="Descripción")
        self.table.heading("#4", text="Foto")
        self.table["show"] = "headings"  # No mostrar la columna interna

        # Llenar la tabla con los elementos
        for item in self.data[self.item_type]:
            photo_path = f"./img/Menu/{item['photo']}"
            photo_display = item['photo'] if os.path.exists(photo_path) else "No Photo"
            self.table.insert("", "end", values=(item["name"], item["price"], item["description"], photo_display))

        # Hacer que la tabla sea seleccionable y vincular el evento
        self.table.bind("<<TreeviewSelect>>", self.on_item_select)
        self.table.pack()

    
    def on_item_select(self, event):
        selected_item = self.table.selection()
        if selected_item:
            item = self.table.item(selected_item[0])
            self.selected_item = item["values"][0]  # Guardar el nombre del item seleccionado

    def change_type(self, item_type):
        self.item_type = item_type
        self.load_item_table()

    def import_json(self):
        file_path = filedialog.askopenfilename(filetypes=[("Archivo JSON", "*.json")])
        if file_path:
            try:
                with open(file_path, "r") as file:
                    self.data = json.load(file)
                messagebox.showinfo("Éxito", "JSON importado exitosamente")
                self.load_item_table()
            except Exception as e:
                messagebox.showerror("Error", f"Error al importar el archivo JSON: {e}")

    def open_add_popup(self):
        self.popup = tk.Toplevel(self.root)
        self.popup.title("Agregar Elemento")
        
        # Combobox para elegir tipo (Menú General o Promociones)
        tk.Label(self.popup, text="Tipo de Elemento").pack(pady=5)
        self.item_type_combobox = ttk.Combobox(self.popup, values=["menu", "promos"])
        self.item_type_combobox.set(self.item_type)  # Default to the current type
        self.item_type_combobox.pack(pady=5)

        tk.Label(self.popup, text="Nombre").pack(pady=5)
        self.name_entry = tk.Entry(self.popup)
        self.name_entry.pack(pady=5)

        tk.Label(self.popup, text="Precio").pack(pady=5)
        self.price_entry = tk.Entry(self.popup)
        self.price_entry.pack(pady=5)

        tk.Label(self.popup, text="Descripción").pack(pady=5)
        self.description_entry = tk.Entry(self.popup)
        self.description_entry.pack(pady=5)

        self.photo_button = tk.Button(self.popup, text="Seleccionar Imagen", command=self.select_image)
        self.photo_button.pack(pady=5)

        self.add_button = tk.Button(self.popup, text="Agregar", command=self.add_item)
        self.add_button.pack(pady=5)

    def open_update_popup(self):
        selected_item_name = self.get_selected_item_name()
        if not selected_item_name:
            messagebox.showerror("Error", "Seleccione un elemento para modificar")
            return
        
        self.popup = tk.Toplevel(self.root)
        self.popup.title("Modificar Elemento")
        
        # Combobox para elegir tipo (Menú General o Promociones)
        tk.Label(self.popup, text="Tipo de Elemento").pack(pady=5)
        self.item_type_combobox = ttk.Combobox(self.popup, values=["menu", "promos"])
        self.item_type_combobox.set(self.item_type)  # Default to the current type
        self.item_type_combobox.pack(pady=5)

        tk.Label(self.popup, text="Nuevo Nombre").pack(pady=5)
        self.name_entry = tk.Entry(self.popup)
        self.name_entry.insert(0, selected_item_name)
        self.name_entry.pack(pady=5)

        tk.Label(self.popup, text="Nuevo Precio").pack(pady=5)
        self.price_entry = tk.Entry(self.popup)
        self.price_entry.pack(pady=5)

        tk.Label(self.popup, text="Nueva Descripción").pack(pady=5)
        self.description_entry = tk.Entry(self.popup)
        self.description_entry.pack(pady=5)

        self.photo_button = tk.Button(self.popup, text="Seleccionar Nueva Imagen", command=self.select_image)
        self.photo_button.pack(pady=5)

        self.update_button = tk.Button(self.popup, text="Modificar", command=self.update_item)
        self.update_button.pack(pady=5)

    def open_delete_popup(self):
        selected_item_name = self.get_selected_item_name()
        if not selected_item_name:
            messagebox.showerror("Error", "Seleccione un elemento para eliminar")
            return
        
        confirm = messagebox.askyesno("Eliminar Elemento", f"¿Estás seguro de que deseas eliminar {selected_item_name}?")
        if confirm:
            delete_item(self.data, self.item_type, selected_item_name)
            messagebox.showinfo("Éxito", f"{selected_item_name} eliminado exitosamente")
            self.load_item_table()

    def select_image(self):
        self.photo_path = filedialog.askopenfilename(filetypes=[("Imagen", "*.png;*.jpg;*.jpeg;*.webp")])

    def add_item(self):
        name = self.name_entry.get()
        price = self.price_entry.get()
        description = self.description_entry.get()
        item_type = self.item_type_combobox.get()

        if not self.photo_path or not name or not price or not description:
            messagebox.showerror("Error", "Todos los campos son requeridos")
            return

        # Guardar la imagen con el nombre del elemento y asegurarse que la extensión sea .png
        photo_name = f"{name.replace(' ', '_').lower()}.png"  # Cambiar a .png
        photo_path = f"./img/Menu/{photo_name}"
        
        try:
            image = Image.open(self.photo_path)
            image.save(photo_path, "PNG")  # Guardar la imagen en formato PNG
        except Exception as e:
            messagebox.showerror("Error", f"Error al guardar la imagen: {e}")
            return

        # Llamamos a la función renombrada para agregar el item
        add_item_to_data(self.data, item_type, name, price, description, photo_name)
        messagebox.showinfo("Éxito", "Elemento agregado exitosamente")
        self.load_item_table()


    def update_item(self):
        old_name = self.get_selected_item_name()
        name = self.name_entry.get()
        price = self.price_entry.get()
        description = self.description_entry.get()
        item_type = self.item_type_combobox.get()

        if not name or not price or not description:
            messagebox.showerror("Error", "Todos los campos son requeridos")
            return

        # Cambiar a formato PNG
        photo_name = f"{name.replace(' ', '_').lower()}.png"  # Cambiado a .png
        photo_path = f"./img/Menu/{photo_name}"
        
        try:
            image = Image.open(self.photo_path)
            image.save(photo_path, "PNG")  # Guardar la imagen como PNG
        except Exception as e:
            messagebox.showerror("Error", f"Error al guardar la imagen: {e}")
            return

        update_item(self.data, item_type, old_name, name, price, description, photo_name)
        messagebox.showinfo("Éxito", "Elemento actualizado exitosamente")
        self.load_item_table()


    def get_selected_item_name(self):
        selected_item = self.table.selection()
        if selected_item:
            item = self.table.item(selected_item[0])
            return item["values"][0]  # Nombre del item seleccionado
        else:
            return None  # Si no hay item seleccionado



if __name__ == "__main__":
    root = tk.Tk()
    app = FastFoodApp(root)
    root.mainloop()
