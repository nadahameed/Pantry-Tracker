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
  const [searchTerm, setSearchTerm] = useState('');


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

  //some other helper functions (modal?)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  //search
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

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
      <Button variant = "contained" onClick={()=>{
        handleOpen()
      }}>Add New Item</Button>
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
    </Box>
);
}
