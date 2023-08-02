### State Range
`state-range` is a very powerfull react state management system library. you can use it with your big application.


### How to use
`usersHandler.js`
```js
import {Store} from 'state-range'
class Users extends Store{
    ...
}

export default new Users
```


`UserList.jsx`
```jsx
import {withStore} from 'state-range'
import Users from 'usersHandler'

const UserList = () => {
    const items = Users.getAll()
    return (
        <ul>
            {
                items.map(item => ...)
            }
        </ul>
    )
}
export default withStore(UserList)
```

```jsx
import {Store, withStore} from 'state-range'
import UserList from 'UserList'
import User from 'usersHandler'

const App = () => {
    return(
        <div>
            <UserList />
            <button onClick={() => {
                User.insert({
                    name: "",
                    email: ""
                })
            }}>Add Item</button>
        </div>
    )
}

```

## Methods

```js
import User from 'usersHandler'
const users = User.find({name: "nax"})

// with query method
const users = User.find({email: "$startWith(nax@)"})

// search
const users = User.find({email: "$search(nax)"})
```


### Query Methods

| Name      | Description                        | Use                         |
| --------- | ---------------------------------- | --------------------------- |
| equal     | `$equal()`- this is default method | `{name: "$equal(abc)"}`     |
| notEqual  | `$notEqual()`                      | `{name: "$notEqual(abc)"}`  |
| startWith | `$startWith()`                     | `{name: "$startWith(abc)"}` |
| endWith   | `$endWith()`                       | `{name: "$endWith(abc)"}`   |
| hasValue  | `$hasValue()`                      | `{name: "$hasValue()"}`     |
| search    | `$search()`                        | `{name: "$search(abc)"}`    |



## withStore
you can pass two args in this function. first is your component and the second is callback. in that callback you need to return an array

```js

import {withStore} from 'state-range'

withStore(Comp, () => {
    return [...]
})
```

## withMemo
you can memoize your component. you can pass two args in this function. first is your component and the second is callback. in that callback you need to return an array

```js

import {withMemo} from 'state-range'

withMemo(Comp, () => {
    return [...]
})
```







