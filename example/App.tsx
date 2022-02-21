import { Box, Stack, Container} from '@mui/material';
import * as React from 'react';
import List from './src/components/List'
import InputField from './src/components/InputField'



export default () => {
   console.log("App")
   return (
      <Container maxWidth="sm" sx={{bgcolor: "#f7f8f9", borderRadius: 2, p: 1}}>
        <InputField />
        <List />
      </Container>
   )
}