import pandas as pd 
import csv
import numpy as np

{
    "Fire" : 0,
    "Water" : 1,
    "Grass" : 2,
    "Bug" : 3,
    "Electric" : 4,
    "Normal" : 5,
    "Ice" : 6,
    "Fighting": 7,
    "Rock": 8,
    "Ground": 9,
    "Flying": 10,
    "Psychic": 11,
    "Poison": 12,
    "Ghost":13,
    "Fairy": 14,
    "Dragon": 15,
    "Dark": 16,
    "Steel": 17,
}
types_order = ["Fire","Water","Grass","Bug","Electric","Normal","Ice","Fighting","Rock","Ground","Flying","Psychic","Poison","Ghost","Fairy","Dragon","Dark","Steel"]
data = pd.read_csv("pokemon.csv")
csv_header = ['index', "types", "name", "generation", "legendary"]
pokemons = []

def pokemon_creator(data, i):
    if type(data["Type 2"][i])==type(""):
        types = [data["Type 1"][i], data["Type 2"][i]]
    else:
        types = [data["Type 1"][i]]
    formated_pokemon = [data["#"][i], types, data["Name"][i],data["Generation"][i], data["Legendary"][i]]
    return formated_pokemon

for i in types_order:
    for j in range(len(data["Type 1"])):
        if data["Type 1"][j] == i:
            pokemons.append(pokemon_creator(data, j))
    
with open('pokemon_formated.csv', 'w', encoding="UTF8") as file :
    # 2. Create a CSV writer
    writer = csv.writer(file)
    writer.writerow(csv_header)
    # 3. Write data to the file
    for i in pokemons:
        writer.writerow(i)