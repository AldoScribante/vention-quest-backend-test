# ⚔️ VENTION QUEST ⚔️

**Instructions to run the project:**

**Instantiations:**

1. Create new DB
   I used docker to create a postgres DB using the following commands:
   - $ docker run --name vention-backend-test -e POSTGRES_DB=vention_quest_db -e POSTGRES_PASSWORD=db_password -p 5432:5432 postgres
   - To start the db use: $ docker start vention-backend-test
   - This will correctly create the required Database

2. Install package dependancies:
   The only package not provided in the original folder is **nodemon** for smoother testing

3. Migrate table data and populate with seed files
   - knex migrate:latest
   - knex seed: run

4. Test using Insomnia, Postman, or equivalent


**Testing**
1. Available API endpoints to test data output

   **Quest API endpoints:**
   - Root route changed to: '/api'
   - router.get('/weapon/power-level/:weapon_id') _Calculates and returns the power level of a weapon based on its compositions_
   - router.put('/material/:id') _Updates the materials table and weapons power\_level id appropriate_
   - router.get('/weapon/quantity/:weapon_id') _Returns maximum weapons that can be crafted as a weaponsClass with quantity added_
   
   **Testing API endpoints**\*
   - router.get('/material/:id') _get a single material_
   - router.get('/material/weapon/:weapon_id') _get all of the base materials for a weapon_
   - router.get('/weapon/all') _Gets all weapons - endpoint was used for testing but the DB call is seperate in the update method_
   - router.get('/weapon/:id') _Get a single weapon_
   - router.get('/composition/tree/:parent_id') _Finds the compostion tree for a given material based on the background information provided_

      \*_There are more API endpoints than asked for to help with testing. These would be removed if needed prior to a production build_

2. Future work on API endpoints
   I would use a library or other method to type protect API inputs only allowing certain objects with certain data types instead of anything and returning null
<br>

**Quest Notes**

1. **Weapon** object created in the database with a model class. Seed weapons have been created:

   1. **20230503155503_weapon_db_migration.js** DB migration file to create 2 tables: 
      -  **weapons**: stores id, name, power_level, qty
      - **weapon_material**: cross table to store materials required for a weapon and qty\* 
   
   2. **003_weapons.js** Seed file to create "Excaliber" and "Magic Staff"
      - **power_level** was manually calculated as a way ot double check later calculations

      \*_qty is not being used at this time but could be used to add more complicated weapons and recipes_
<br>
2. Method getPowerLevel implemented to get weapon power level based on compositions. 
   This function recursively fetches all required materials from the compositon tree. It then moves through the tree calculating the power level based on the formula provided in **Background Terminilogies**. Once the power level is calculated then it is compared to the existing power_level which is updated in the DB if needed 
   
   Future work:
   - Right now an update is run on all weapons which is fine for small data sets but if weapons data got too large then I would adjust the call to only update weapons with a composition chain that included updated material
   - I would move the calls to MaterialService and ComposistionService to a seperate Service File.
   - I would also reduce the database calls by calling find().getPowerLevel() from the service class and updating how the recursie data is fetched
<br>
3. (and 4) API endpoint to update material power level making sure the weapon(s) that uses it is also updated.
   - The PUT endpoint is called from **materialsRouter.js**
   - materials.id can not be updated
   - Once the update has been completed the router checks if the properties would affect the weapons table and then recalcualtes the power level by calling getPowerLevel()
   
   Future work:
   - Move the call to getPowerLevel() out of the materials router and move it to a service instead, hoever due to the file structure doing so currently without refactoring causes a circular dependancny that would need to be addressed
<br>
5. API endpoint to fetch the maximum quantity of a single **Weapon** that we can build.
   - Based on the formula that is provided in **Background -> Quests -> 5**
   - Uses the same composition tree from task 2 but adds the materials.material_qty amount for the calculation. Basic factor has been added to try and determine how multiple recipes using the same material would affect the total output.
      - e.x Excalibur has recipe ID1, ID6, ID9, ID12 with repeated materials in the recipe. ID 12 is used 3 times for example. This means that the total for ID12 that can be made is not 120/1 = 120 but 120/3/1 = 40
   
   Future Work
   - Simplify the Array structure to avoid needing several flattens and loops
   - Improve the factor function used to be more robust
<br>
----------------------------------------------------------------------------------------------------------------------

**Background Information Provided**

**GOAL**

- Complete the Quests listed below.
- Provide access to your code, e.g. link to a GitHub repo.
- Aim for performance and code efficiency
  <br />
  <br />

**TERMINOLOGIES**

- A composition is a mapping between materials.
- A material can be composed of other materials with a specified quantity.
- A composition is a top down tree without repeated materials.
- A weapon is composed of **multiple materials**. It has a **name**, **power_level**, and **qty**.
- A material has a **base_power**, which influences the **power_level** of any weapon that uses it.
  > For example, an "Axe" weapon is composed of materials with ID 9 and 12, has a power level of:
  >
  > > ID 9 ➡️ 90 + 5*(130 + 10*220) = **11,740**
  > > > 90 = the Base Power of material ID(9)
  > > >
  > > > 5 = the quantity required to make 1 unit of material ID(9) from ID(10)
  > > >
  > > > 130 = the Base Power of material ID(10)
  > > >
  > > > 10 = the quantity required to make 1 unit of material ID(10) from ID(11)
  > > >
  > > > 220 = the Base Power of material ID(11)
  > >
  > > ID 12 ➡️ **300**
  > > > 300 = the Base Power of material ID (12)
  > >
  > > Total would be **12040**

Reference diagram from the seed data:
<br />

<img width="1004" alt="materials" src="https://user-images.githubusercontent.com/13532850/235346434-2f318669-ff0b-4b34-8156-5942eafa097b.png">

<br />
<br />

**QUESTS**:

1. Design and create a **Weapon** object in the database and a model class. Create the following seed weapons\*:

   > **Excalibur** composed of the following list of materials: ID(1), ID(6), ID(9), ID(12)
   >
   > **Magic Staff** composed of the following material: ID(6)

   \*_Seed files for materials & compositions are already created._

2. Implement method on the Weapon class to compute total power level of a weapon based on its composition(s).

3. API endpoint to update material power level and making sure the weapon(s) that uses it is also updated.

4. Update method for **Material** class.
   _The "**find**" method is already created_
   > Another note: Update of an material should follow quest #3's logic as well
5. API endpoint to fetch the maximum quantity of a single **Weapon** that we can build.
   > Example. **Axe** can be built:
   >
   > ID 9 ➡️ 25 + ((100 + (110/10) ) / 5) = 47
   >
   > ID 12 ➡️ 120
   >
   > Max number of builds = 47

----------------------------------------------------------------------------------------------------------------------
