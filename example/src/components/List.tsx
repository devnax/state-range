import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

import {withStore} from '../../../.'
import Todo from '../models/Todo'

const UIList = () => {
  const todos = Todo.find()
  // console.log("List")
  return (
    <List sx={{ width: '100%', mt: 2,bgcolor: 'background.paper' }}>
      {todos.map(({title, _id}, idx) => {

        return (
          <ListItem
            key={idx}
            secondaryAction={
              <>
                <IconButton  onClick={() => {
                  Todo.setMeta('title', title)
                  Todo.setMeta('edit', _id)
                }}>
                  <ModeEditIcon />
                </IconButton>
                <IconButton onClick={() => Todo.delete(_id)}>
                  <DeleteIcon />
                </IconButton>
                
              </>
            }
            disablePadding
          >
            <ListItemButton role={undefined} dense>
              <ListItemText  primary={title} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

export default withStore(UIList)
