"use client"; //to make it a client sided app
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Card,
  Modal,
  Stack,
  TextField,
  Typography,
  ThemeProvider,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  setDoc,
  doc,
} from "firebase/firestore";
import { createTheme } from "@mui/material/styles";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState(""); //use to set the name of the item we are adding
  //search functionality:
  const [searchTerm, setSearchTerm] = useState("");
  //recipe functionality:
  const [recipes, setRecipes] = useState([]); //holds generated recipes
  const [recipesOpen, setRecipesOpen] = useState(false); //controls recipe visibility

  //API
  const SPOONACULAR_API_KEY = "2ee69632ec6442f1ab04f9f06eb054db";

  //updating from firebase
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  //helpers

  //remove an item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item); //gets direct item reference
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  //add an item
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item); //gets direct item reference
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  //only happens when you first load the page
  useEffect(() => {
    updateInventory();
  }, []);

  //some other helper functions (modal visibility)
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRecipesOpen = () => setRecipesOpen(true);
  const handleRecipesClose = () => setRecipesOpen(false);

  //search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //RECIPES
  //get recipes based on inventory:
  const generateRecipes = async () => {
    const ingredients = inventory.map((item) => item.name);
    const fetchedRecipes = await getRecipe(ingredients);
    setRecipes(fetchedRecipes);
    handleRecipesOpen();
  };

  const getRecipe = async (ingredients) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredients.join(
          ","
        )}&number=3`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const recipes = await response.json();
      return recipes;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  };

  //get recipe info/url
  const getRecipeInformation = async (recipeId) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const recipeInfo = await response.json();
      return recipeInfo;
    } catch (error) {
      console.error("Error fetching recipe information:", error);
      return null;
    }
  };

  //custom colors and fonts
  const theme = createTheme({
    palette: {
      primary: {
        main: "#E8B363",
        // light: will be calculated from palette.primary.main,
        // dark: will be calculated from palette.primary.main,
        // contrastText: will be calculated to contrast with palette.primary.main
      },
      secondary: {
        main: "#BDD979",
        light: "#CEE19F",
        // dark: will be calculated from palette.secondary.main,
        contrastText: "#2A2C24",
      },
    },

    typography: {
      fontFamily: [
        "Georgia", // the custom font (all others are backups)
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
    },
  });

  return (
    <Box
      sx={{
        backgroundColor: "#ADD8E6",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
      }}
    >
      <ThemeProvider theme={theme}>
        <Card
          sx={{
            maxWidth: "1000px",
            maxHeight: "700px",
            margin: "20px auto",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid #ccc",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <Modal open={open} onClose={handleClose}>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                width={400}
                bgcolor="white"
                border="2px solid #000"
                boxShadow={24}
                p={4}
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                  transform: "translate(-50%,-50%)",
                }}
              >
                <Stack width="100%" direction="row" spacing={2}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName);
                      setItemName("");
                      handleClose();
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>

            {/* header */}
            <Box
              width="100%"
              maxWidth="800px"
              bgcolor={theme.palette.primary.main}
              color="#fff"
              p={1}
              borderRadius={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h3">PANTRY TRACKER</Typography>
            </Box>

            <Stack direction="row" spacing={12} p={1}>
              <Button variant="contained" onClick={handleOpen}>
                Add New Item
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={generateRecipes}
              >
                Find Recipes
              </Button>
            </Stack>

            <Box border="1px solid #333">
              <Box
                width="800px"
                height="50px"
                bgcolor="#ADD8E6"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h4" color="#333">
                  ITEMS
                </Typography>
              </Box>

              <TextField
                variant="outlined"
                placeholder="Search items..."
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Stack width="800px" height="300px" spacing={2} overflow="auto">
                {filteredInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="70px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bgColor="#f0f0f0"
                    padding={5}
                  >
                    <Typography variant="h5" color="#333" textAlign="center">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="h5" color="#333" textAlign="center">
                      {quantity}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={() => {
                          addItem(name);
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          removeItem(name);
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                ))}
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
                border="1px solid #ddd"
                boxShadow={24}
                p={2}
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Typography variant="h4" color="#333" textAlign="center">
                  Recipes
                </Typography>
                <Stack spacing={2}>
                  {recipes.map((recipe, index) => (
                    <Box
                      key={index}
                      padding={2}
                      border="1px solid #ddd"
                      borderRadius={5}
                    >
                      <Typography variant="h5" color="#000">
                        {recipe.title}
                      </Typography>

                      {/* used ingredients */}
                      <Typography variant="body1" color="#555">
                        <strong>Used Ingredients:</strong>{" "}
                        {recipe.usedIngredients
                          .map((ingredient) => ingredient.name)
                          .join(", ")}
                      </Typography>

                      {/* missing ingredients */}
                      <Typography variant="body1" color="#555">
                        <strong>Missing Ingredients:</strong>{" "}
                        {recipe.missedIngredients
                          .map((ingredient) => ingredient.name)
                          .join(", ")}
                      </Typography>

                      {/* unused ingredients */}
                      {recipe.unusedIngredients.length > 0 && (
                        <Typography variant="body1" color="#555">
                          <strong>Unused Ingredients:</strong>{" "}
                          {recipe.unusedIngredients
                            .map((ingredient) => ingredient.name)
                            .join(", ")}
                        </Typography>
                      )}

                      {/* get recipe button */}
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginTop={1}
                      >
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={async () => {
                            const recipeInfo = await getRecipeInformation(
                              recipe.id
                            );
                            if (recipeInfo && recipeInfo.sourceUrl) {
                              window.open(recipeInfo.sourceUrl, "_blank");
                            }
                          }}
                        >
                          Get Recipe
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Modal>
          </Box>
        </Card>
        <Typography variant="caption">Nada Hameed</Typography>
        <Typography variant="caption">Recipes from Spoonacular API</Typography>
      </ThemeProvider>
    </Box>
  );
}
