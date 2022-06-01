import { Box, Stack, TextField, IconButton } from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Todo from '../models/Todo'
import {withStore, dispatch} from '../../../.' 



const InputField = () => {
   const title    = Todo.getMeta("title", '')
   
   const editId   = Todo.getMeta("edit")
   // console.log("Input Field")
   
   return (
      <Stack direction='row' spacing={1}>
         <Box flex={1}>
            <TextField 
               size="small"
               fullWidth
               value={title || ""}
               onChange={(e) => {
                  Todo.setMeta("title", e.target.value)
               }}
            />
         </Box>
         <Box>

            {
               editId ? <IconButton  onClick={() => {
                  dispatch(() => {
                     if(title){
                        Todo.update({
                           title: Todo.getMeta("title") || ""
                        }, editId)
                     }
                     
                     Todo.deleteMeta('title')
                     Todo.deleteMeta('edit')
                  })
               }}>
                  <ModeEditIcon />
               </IconButton> : <IconButton  onClick={() => {
               

               dispatch(() => {
                  if(title){
                     Todo.insert({
                        title: Todo.getMeta("title") || ""
                     })
                  }
                  Todo.deleteMeta('title')
               })
            }}>
               <AddIcon />
            </IconButton>
            }
            
         </Box>
      </Stack>
   )
}


export default withStore(InputField)