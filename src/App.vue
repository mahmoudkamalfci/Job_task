<template>
  <v-app>
   
    <v-main>
      <HotelList/>
    </v-main>
  </v-app>
</template>

<script>
import HotelList from './components/HotelList';

export default {
  name: 'App',

  components: {
    HotelList,
  },

  data: () => ({
    hotels: []
  })
};
</script>
