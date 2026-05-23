const { createApp, onMounted } = Vue;

createApp({
  setup() {
    const form = Vue.ref({
      fullName: '',
      dob: '',
      gender: '',
      totalVisitors: null,
      childrenCount: null,
      accommodation: '',
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    
    const errors = Vue.ref({
      fullName: '',
      dob: '',
      gender: '',
      selectedPlaces: '',
      totalVisitors: '',
      childrenCount: '',
      accommodation: '',
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    
    const generalError = Vue.ref('');
    const places = Vue.ref([]);
    const isLoadingPlaces = Vue.ref(true);
    const placesError = Vue.ref('');
    const selectedPlaces = Vue.ref([]);
    const accommodationOptions = Vue.ref([
      'No accommodation needed',
      'Forest View Hotel',
      'Totoro Family Inn',
      'Witch Valley Guesthouse',
      'Luxury Ghibli Resort'
    ]);
    const showSummary = Vue.ref(false);
    
    const isPlaceSelected = (placeId) => {
      return selectedPlaces.value.some(p => p.id === placeId);
    };
    
    const togglePlace = (place) => {
      const index = selectedPlaces.value.findIndex(p => p.id === place.id);
      if (index === -1) {
        selectedPlaces.value.push(place);
      } else {
        selectedPlaces.value.splice(index, 1);
      }
      if (errors.value.selectedPlaces) {
        errors.value.selectedPlaces = '';
      }
    };
    
    const loadPlaces = async () => {
      isLoadingPlaces.value = true;
      placesError.value = '';
      try {
        const response = await fetch('ghibli_park.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        places.value = data;
      } catch (err) {
        console.error("Failed to load places:", err);
        placesError.value = 'Unable to load Ghibli Park attractions. Please check the JSON file or network.';
      } finally {
        isLoadingPlaces.value = false;
      }
    };
    
    const clearErrors = () => {
      for (let key in errors.value) {
        errors.value[key] = '';
      }
      generalError.value = '';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Not provided';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const maskedCardNumber = Vue.computed(() => {
      const num = form.value.cardNumber.replace(/\s/g, '');
      if (num.length < 4) return '****';
      return '**** **** **** ' + num.slice(-4);
    });
    
    const validateForm = () => {
      let isValid = true;
      
      if (!form.value.fullName.trim()) {
        errors.value.fullName = 'Full name is required.';
        isValid = false;
      } else {
        errors.value.fullName = '';
      }
      
      if (!form.value.dob) {
        errors.value.dob = 'Date of birth is required.';
        isValid = false;
      } else {
        errors.value.dob = '';
      }
      
      if (!form.value.gender) {
        errors.value.gender = 'Please select your gender.';
        isValid = false;
      } else {
        errors.value.gender = '';
      }
      
      if (selectedPlaces.value.length === 0) {
        errors.value.selectedPlaces = 'Please select at least one Ghibli Park place.';
        isValid = false;
      } else {
        errors.value.selectedPlaces = '';
      }
      
      if (form.value.totalVisitors === null || form.value.totalVisitors === '' || form.value.totalVisitors < 1) {
        errors.value.totalVisitors = 'Total number of visitors must be at least 1.';
        isValid = false;
      } else {
        errors.value.totalVisitors = '';
      }
      
      if (form.value.childrenCount === null || form.value.childrenCount === '' || form.value.childrenCount < 0) {
        errors.value.childrenCount = 'Number of children must be 0 or more.';
        isValid = false;
      } else if (form.value.childrenCount > form.value.totalVisitors) {
        errors.value.childrenCount = 'Children count cannot exceed total visitors.';
        isValid = false;
      } else {
        errors.value.childrenCount = '';
      }
      
      if (!form.value.accommodation) {
        errors.value.accommodation = 'Please select an accommodation option.';
        isValid = false;
      } else {
        errors.value.accommodation = '';
      }
      
      if (!form.value.cardholderName.trim()) {
        errors.value.cardholderName = 'Name on card is required.';
        isValid = false;
      } else {
        errors.value.cardholderName = '';
      }
      
      if (!form.value.cardNumber.trim()) {
        errors.value.cardNumber = 'Card number is required.';
        isValid = false;
      } else {
        const cardNumClean = form.value.cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cardNumClean)) {
          errors.value.cardNumber = 'Card number must contain 13-19 digits.';
          isValid = false;
        } else {
          errors.value.cardNumber = '';
        }
      }
      
      if (!form.value.expiryDate) {
        errors.value.expiryDate = 'Expiration date is required.';
        isValid = false;
      } else {
        const today = new Date();
        const selectedDate = new Date(form.value.expiryDate + '-01');
        if (selectedDate < today) {
          errors.value.expiryDate = 'Expiration date must be in the future.';
          isValid = false;
        } else {
          errors.value.expiryDate = '';
        }
      }
      
      if (!form.value.cvv) {
        errors.value.cvv = 'CVC is required.';
        isValid = false;
      } else {
        if (!/^\d{3,4}$/.test(form.value.cvv)) {
          errors.value.cvv = 'CVC must be 3 or 4 digits.';
          isValid = false;
        } else {
          errors.value.cvv = '';
        }
      }
      
      return isValid;
    };
    
    const generateItinerary = () => {
      clearErrors();
      showSummary.value = false;
      
      const formValid = validateForm();
      
      if (!formValid) {
        generalError.value = 'There are mandatory items pending to be filled. Please complete the required fields.';
        showSummary.value = false;
      } else {
        generalError.value = '';
        showSummary.value = true;
        setTimeout(() => {
          document.querySelector('.summary-box')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };
    
    const handleMissingImage = (event) => {
      event.target.src = 'https://via.placeholder.com/300x180?text=Image+Not+Found';
    };
    
    onMounted(() => {
      loadPlaces();
    });
    
    return {
      form,
      errors,
      generalError,
      places,
      isLoadingPlaces,
      placesError,
      selectedPlaces,
      accommodationOptions,
      showSummary,
      isPlaceSelected,
      togglePlace,
      generateItinerary,
      formatDate,
      maskedCardNumber,
      handleMissingImage
    };
  }
}).mount('#app');