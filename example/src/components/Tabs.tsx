import * as React from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Todo from '../models/Todo'
import { withStore } from '../../../.'



const _First = () => {
   React.useEffect(() => () => console.log("Exit"))
   return <Box>First</Box>
}

const First = withStore(_First)

const TabView = () => {
   const value = Todo.getMeta("tab_value")

   return (
      <Box mt={2}>
         <Tabs
            value={value}
            onChange={(e: any, val: any) => {
               Todo.setMeta("tab_value", val);
            }}
         >
            <Tab value="First" label="First" />
            <Tab value="Second" label="Second" />
            <Tab value="Third" label="Third" />
         </Tabs>

         <Box mt={1}>
            {
               value === 'First' && <First />
            }
         </Box>
      </Box>
   )
}

export default withStore(TabView)