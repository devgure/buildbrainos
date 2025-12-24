import React from 'react'
import { initAuth } from './services/auth'
import { View, Text } from 'react-native'

export default function App() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    initAuth().finally(() => setReady(true))
  }, [])
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>BuildBrain Mobile {ready ? 'Ready' : 'Initializing auth...'}</Text>
    </View>
  )
}
