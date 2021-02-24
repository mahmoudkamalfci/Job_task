<template>
  <v-container>
    <v-form v-model="valid" ref="form" id="dateForm">
      <v-row class="dataRange">
        <v-col cols="12" sm="6" md="4">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="from"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <div class="d-flex">
                <label for="From" class="pt-5 mr-5">From: </label>
                <v-text-field
                  v-model="from"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[compareToDates(from, to)]"
                ></v-text-field>
              </div>
            </template>
            <v-date-picker v-model="from" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.menu.save(from)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-menu
            ref="menu2"
            v-model="menu2"
            :close-on-content-click="false"
            :return-value.sync="to"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <div class="d-flex">
                <label for="From" class="pt-5 mr-5">To: </label>
                <v-text-field
                  v-model="to"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[compareToDates(from, to)]"
                ></v-text-field>
              </div>
            </template>
            <v-date-picker v-model="to" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu2 = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.menu2.save(to)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-form>
    <v-row>
      <v-col>
        <p class="totalNight" v-if="numberOfNights">
          <strong>Total Night:</strong> {{ numberOfNights }}
        </p>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-select
              :items="nameSoringAray"
              v-model="namesorting"
              solo
              placeholder="Sort by Name"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              :items="priceSoringAray"
              v-model="pricesorting"
              solo
              placeholder="Sorting by Price"
            ></v-select>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <div>
          <v-text-field
            placeholder="Hotel Name"
            prepend-inner-icon="search"
            solo
            v-model="hotelName"
          ></v-text-field>
        </div>

        <label for="price">Filter By Price</label>
        <v-slider
          class="mt-10"
          v-model="PriceRange"
          thumb-label="always"
          min="200"
          max="325"
        ></v-slider>
      </v-col>
      <v-col cols="9" class="px-0" v-if="hotels.length > 0">
        <v-row>
          <v-col cols="6" sm="6" v-for="(hotel, index) in hotels" :key="index">
            <div class="hotel">
              <p class="name">
                <strong>Name: </strong>
                {{ hotel.name }}
              </p>
              <p class="price">
                <strong>Price: </strong>
                <span v-if="numberOfNights">
                  {{ hotel.price * numberOfNights }}
                </span>
                <span v-if="!numberOfNights">
                  {{ hotel.price }}
                </span>
              </p>
              <p class="city">
                <strong>Price: </strong>
                {{ hotel.city }}
              </p>
              <p class="city">
                <strong>Price: </strong>
                {{ hotel.available_on }}
              </p>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EventService from "@/Services/EventService.js";

export default {
  name: "HotelList",

  data: () => ({
    hotelName: "",
    valid: false,
    from: "",
    to: "",
    dateValidationError: "",
    menu: false,
    menu2: false,
    modal: false,
    hotels: [],
    allHotelsData: [],
    numberOfNights: "",
    sortedName: false,
    nameSoringAray: ["A-Z", "Z-A"],
    namesorting: "",

    sortedPrice: false,
    priceSoringAray: ["low-to-high", "high-to-low"],
    pricesorting: "",
    PriceRange: 0,
  }),
  watch: {
    hotelName: {
      handler() {
        this.getSearchResult(this.hotelName);
      },
    },
    namesorting: {
      handler() {
        if (this.namesorting) {
          this.pricesorting = "";
          this.sortingHotelsByName();
        }
      },
    },
    pricesorting: {
      handler() {
        if (this.pricesorting) {
          this.namesorting = "";
          this.sortingHotelsByPrice();
        }
      },
    },
    from: {
      handler() {
        if (this.valid && this.from && this.to) {
          this.getDataOnDateRange(this.from, this.to);
        }
      },
    },
    to: {
      handler() {
        if (this.valid && this.from && this.to) {
          this.getDataOnDateRange(this.from, this.to);
        }
      },
    },
    PriceRange: {
      handler() {
        if (this.PriceRange > 0) {
          this.filterByPriceRange();
        }
      },
    },
  },
  methods: {
    // get Data from api
    getData() {
      EventService.getEvent(
        "https://run.mocky.io/v3/90e1d920-afca-4101-8a97-9097310d7e8a",
        false
      ).then((response) => {
        if (response.status == 200) {
          this.hotels = response.data;
          this.allHotelsData = response.data;
        }
      });
    },
    // get data on dateRange
    getDataOnDateRange(from, to) {
      this.hotels = this.allHotelsData;
      if (from != "" && to != "") {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        this.numberOfNights = "";
        // To calculate the time difference of two dates
        var Difference_In_Time = toDate.getTime() - fromDate.getTime();

        // To calculate the no. of days between two dates
        this.numberOfNights = Difference_In_Time / (1000 * 3600 * 24);
        const hotels = this.hotels.filter((hotel) => {
          const hotelDate = new Date(hotel.available_on);
          return hotelDate <= fromDate;
        });
        this.hotels = hotels;
      } else {
        this.hotels = this.allHotelsData;
      }
    },

    // for date validation
    compareToDates(from, to) {
      if (from && to) {
        let start = new Date(from);
        let end = new Date(to);

        return start > end ? "Start date should be less than end date" : true;
      }
      return true;
    },
    // get search result
    getSearchResult(name) {
      this.hotels = this.allHotelsData;
      console.log("asdSearch");
      if (name) {
        const hotels = this.hotels.filter((hotel) => {
          return hotel.name.toLowerCase().includes(name.toLowerCase());
        });
        this.hotels = hotels;
      } else {
        this.hotels = this.allHotelsData;
      }
    },

    // this function for sorting hotels by name (a-z && z-a)
    sortingHotelsByName() {
      this.hotels.sort(this.compareByName);
      if (this.namesorting == "A-Z") {
        this.sortedName = true;
      } else if (this.namesorting == "Z-A") {
        this.sortedName = false;
      }
    },
    // this function for sorting hotels by name (a-z && z-a)
    sortingHotelsByPrice() {
      this.hotels.sort(this.compareByPrice);
      if (this.pricesorting == "low-to-high") {
        this.sortedPrice = true;
      } else if (this.pricesorting == "high-to-low") {
        this.sortedPrice = false;
      }
    },

    // this function to compare values first and second to make sorting
    compareByName(firstHotel, secondHotel) {
      const hotel1 = firstHotel.name.toLowerCase();
      const hotel2 = secondHotel.name.toLowerCase();

      let comparison = 0;
      if (this.sortedName == false) {
        if (hotel1 > hotel2) {
          comparison = 1;
        } else if (hotel1 < hotel2) {
          comparison = -1;
        }
      } else {
        if (hotel1 > hotel2) {
          comparison = -1;
        } else if (hotel1 < hotel2) {
          comparison = 1;
        }
      }
      return comparison;
    },

    // this for price sorting
    compareByPrice(firstHotel, secondHotel) {
      console.log("asd");
      const hotel1 = firstHotel.price;
      const hotel2 = secondHotel.price;

      let comparison = 0;
      if (this.sortedPrice == false) {
        if (hotel1 > hotel2) {
          comparison = 1;
        } else if (hotel1 < hotel2) {
          comparison = -1;
        }
      } else {
        if (hotel1 > hotel2) {
          comparison = -1;
        } else if (hotel1 < hotel2) {
          comparison = 1;
        }
      }
      return comparison;
    },

    filterByPriceRange() {
      this.hotels = this.allHotelsData;

      const hotels = this.hotels.filter((item) => {
        return item.price <= this.PriceRange;
      });

      console.log(hotels);
      this.hotels = hotels;
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
.hotel {
  border: 1px solid #000000;
  padding: 12px;
}
</style>
