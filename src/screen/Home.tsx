import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import TopCarServices from '../component/TopCarServices'
import Banner from '../component/Banner'
import axios from 'axios'
import Accessories from '../component/Accessories'
import { ScrollView } from 'react-native'

const Home = () => {
  

  return (
    <ScrollView>
      <Banner/>
     <TopCarServices/>
     <Accessories/>
    </ScrollView>
  )
}

export default Home