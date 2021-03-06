'use strict';

import { Box, Stack, Container} from '@mui/material';
import * as React from 'react';
import List from './src/components/List'
import InputField from './src/components/InputField'
// import Tabs from './src/components/Tabs'
import MenuHandler from './src/models/MenuHandler';



export default () => {
   return (
      <Container maxWidth="sm" sx={{bgcolor: "#f7f8f9", borderRadius: 2, p: 1}}>
         <button
            onClick={() => {
               MenuHandler.create({
                  title: "Demo",
                  path: "/home"
               })
            }}
         >
            Create
         </button>


        <InputField />
        <List />  
        {/* <Tabs />   */}
      </Container>
   )
}