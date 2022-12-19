# X-Check (Finding symptoms of infectious diseases and their treatments)  
  
This repository includes the final product of Group 3 in the course  
PRA3006 Programming in the Life Sciences of the academic year 2022/2023.  
  
  
## Contents  
  
This repository includes the following elements:  
- README file, including instructions and important notes on the product
- AUTHORS file, listing the names and usernames of authors that significantly contributed to the repository
- LICENSE file, stating the permissions and restrictions of (re)using the product and its underlying code
- Website folder, containing all code for the product
  
    
## How to open the website  
  
1. Download the files of this repository.
2. If necessary, unzip the downloaded files.
3. Open the website folder.
4. In a webbrowser, open the homepage.html file.
5. The website is intended to function without the need to open any of the other files. However, it is necessary that all files and elements stay in their original locations in order for the website to function properly.
  
  
## How to use the website  
  
### 1. Select an infectious disease  
This can be done in three different ways, depending on the preferences and needs of the user.  
The first way is to enter the complete name of an infectious disease directly into the searchbar. If the disease is included in the database, its symptoms will directly appear in the wheel underneath.  
The second way is to enter a part of the name of an infectious disease in the searchbar. The dropdown menu will list all infectious diseases of the database that include the entered letters. By clicking on one of the diseases in the dropdown menu, the corresponding disease is selected.  
The third way is to use the "Show Example" button. It will randomly select one of the infectious diseases of the database.  
  
### 2. Select one or multiple symptoms  
After an infectious disease has been selected, a wheel showing the symptoms of the disease will appear below the searchbar. By clicking on a symptom, the wheel will rotate until the clicked symptom is oriented towards the right. The speech bubble box on the right of the wheel will show information about that symptom. By clicking the "select" button on the right of the speech bubble box, treatments of the selected symptom will be retrieved (see step 3). Any number of symptoms on the wheel may be seected or deselected.  
  
### 3. Select a tratment option
The selected symptoms are displayed as circles in the venn diagram underneath the wheel. The size of the circle is relative to the available treatments available for the respective symptom. Overlap of circles indicate treatments that are intended to cure all symptoms included in the overlap. When selecting a circle or overlap by clicking on it, a list of the available treatment will appear on the right of the venn diagram. If no circle appears for a selected symptom, no treatments are currently available in the database.  
  
  
## Website Limitations  
  
Two main limitations are associated with this product.  
  
### 1. Wikidata limitations
The information retrieved from the Wikidata database and displayed on the website is often not accurate and/or useful. Symptoms, symptom descriptions and treatment options are often not reliable (e.g. "Symptom" as a description of a symptom). We do not have any influence on this information, and hence we do not take any responsibility for the information displayed on the website. All information should be evaluated with caution.  
  
### 2. Design limitations
The goal of this product is not aesthetic and/or user-friendly design of a website, but only the functionality in entering and retrieving information from a database. Therefore, inconveniences in the display might occur.  
  

## Code Notation  
In this project dunder (__x) notation was used when naming functions (x) that may be called from other files, most notably the queries from queries.js

