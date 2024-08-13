'use client' //to make it a client sided app
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";


export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('') //use to set the name of the item we are adding
  //search functionality:
  const [searchTerm, setSearchTerm] = useState('')
  //recipe functionality:
  const [recipes, setRecipes] = useState([]) //holds generated recipes
  const [recipesOpen, setRecipesOpen] = useState(false) //controls recipe visibility

  //API
  const SPOONACULAR_API_KEY = '2ee69632ec6442f1ab04f9f06eb054db'


  //updating from firebase
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  } 

  //helpers

  //remove an item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) //gets direct item reference
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  //add an item
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) //gets direct item reference
    const docSnap = await getDoc(docRef)


    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
      }
      else {
        await setDoc(docRef, {quantity: 1})
      }

    await updateInventory()
  }

  //only happens when you first load the page
  useEffect(() => {
    updateInventory()
  }, [])

  //some other helper functions (modal visibility)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleRecipesOpen = () => setRecipesOpen(true)
  const handleRecipesClose = () => setRecipesOpen(false)

  //search
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //RECIPES
  //get recipes based on inventory:
  const generateRecipes = async () => {
    const ingredients = inventory.map((item) => item.name)
    const fetchedRecipes = await getRecipe(ingredients)
    setRecipes(fetchedRecipes)
    handleRecipesOpen()
  }

  const getRecipe = async (ingredients) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredients.join(',')}&number=3`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const recipes = await response.json()
      return recipes;
    } catch (error) {
      console.error('Error fetching recipes:', error)
      return [];
    }
  }

  //get recipe info/url
  const getRecipeInformation = async (recipeId) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`
      )
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const recipeInfo = await response.json()
      return recipeInfo;
    } catch (error) {
      console.error('Error fetching recipe information:', error)
      return null;
    }
  };
  
  

  return (
    <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap={2}>
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute"
          top="50%" left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}>
            
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant='outlined'
                fullWidth
                value={itemName}
                onChange={(e)=>{
                  setItemName(e.target.value)
                }}
              />
              <Button variant="outlined" onClick={()=> {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}>
                Add
              </Button>
            </Stack>
        </Box>
      </Modal>

      <Button variant = "contained" onClick={handleOpen}>Add New Item</Button>

      <Button variant = "contained" color="secondary" onClick={generateRecipes}>
        Generate Recipes
      </Button>

      <Box border="1px solid #333">
        <Box 
          width="800px" 
          height="100px" 
          bgcolor='#ADD8E6' 
          display="flex"
          alignItems="center" 
          justifyContent="center">
          <Typography variant="h2" color='#333'>Inventory Items</Typography>
        </Box>

        <TextField 
          variant="outlined" 
          placeholder="Search items..." 
          fullWidth 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
        />
        
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {
          filteredInventory.map(({name, quantity}) => (
            <Box 
              key={name}
              width="100%"
              minHeight="150px" 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              bgColor="#f0f0f0"
              padding={5}>
                <Typography variant="h3" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center">
                  {quantity}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                  <Button variant="contained" 
                    onClick={() => {
                      addItem(name)
                    }}>
                      Add
                    </Button>
                  <Button variant="contained" 
                    onClick={() => {
                      removeItem(name)
                    }}>
                      Remove
                    </Button>
                    </Stack>

            </Box>
          ))
        }
      </Stack>
      </Box>

      {/* modal for displaying recipes */}
      <Modal open={recipesOpen} onClose={handleRecipesClose}>
  <Box
    position="absolute"
    top="50%"
    left="50%"
    width={600}
    bgcolor="white"
    border="2px solid #000"
    boxShadow={24}
    p={4}
    display="flex"
    flexDirection="column"
    gap={3}
    sx={{
      transform: 'translate(-50%, -50%)', // Adjust the position to center the modal
    }}
  >
    <Typography variant="h4" color="#333" textAlign="center">
      Generated Recipes
    </Typography>
    <Stack spacing={2}>
      {recipes.map((recipe, index) => (
        <Box key={index} padding={2} border="1px solid #ddd" borderRadius={5}>
          <Typography variant="h5" color="#000">{recipe.title}</Typography>
          
          {/* Display Used Ingredients */}
          <Typography variant="body1" color="#555">
            <strong>Used Ingredients:</strong> {recipe.usedIngredients.map(ingredient => ingredient.name).join(', ')}
          </Typography>

          {/* Display Missed Ingredients */}
          <Typography variant="body1" color="#555">
            <strong>Missed Ingredients:</strong> {recipe.missedIngredients.map(ingredient => ingredient.name).join(', ')}
          </Typography>

          {/* Display Unused Ingredients */}
          {recipe.unusedIngredients.length > 0 && (
            <Typography variant="body1" color="#555">
              <strong>Unused Ingredients:</strong> {recipe.unusedIngredients.map(ingredient => ingredient.name).join(', ')}
            </Typography>
          )}

          {/* Add the Recipe Link Button */}
          <Button variant="contained" color="primary" onClick={async () => {
            const recipeInfo = await getRecipeInformation(recipe.id);
              if (recipeInfo && recipeInfo.sourceUrl) {
              window.open(recipeInfo.sourceUrl, '_blank');
            }
          }}>
          Get Recipe
          </Button>
        </Box>
      ))}
    </Stack>
  </Box>
</Modal>



    </Box>
)
}
