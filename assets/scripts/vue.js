const {createApp} = Vue

createApp({
    data() {
        return {
            events : [],
            currentDate : '',
            upcomingEvents : [],
            pastEvents : [],
            categories : [],
            moneyFormat : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            numberFormat : new Intl.NumberFormat('en-US'),
            percentage : new Intl.NumberFormat('default', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1,}),
            search : '',
            selectedCheckboxs : [],
            auxEvents : [],
            statsEvents : [],
            statsUpcoming : [],
            statsPast : [],
            detail : {},
        }
    },
    created() {
        fetch('https://amazing-events.herokuapp.com/api/events')
            .then((response) => response.json())
            .then(data =>{

                this.currentDate = new Date (data.currentDate)

                if (document.title == 'Home'){ 
                    this.events = data.events
                }
    
                else if (document.title == 'Upcoming Events'){ 
                    this.events = data.events.filter(event => new Date(event.date) > this.currentDate)
                }
                
                else if (document.title == 'Past Events'){
                    this.events = data.events.filter(event => new Date(event.date) < this.currentDate)
                }
                else {
                    const params = new URLSearchParams(location.search)
                    const idDetail = params.get("id")
                    this.events = data.events
                    this.detail = this.events.find((event)=>event._id === idDetail)
                    this.pastEvents = this.events.filter(event => new Date(event.date) < this.currentDate)
                    this.upcomingEvents = this.events.filter(event => new Date(event.date) > this.currentDate)
                }
                this.statsEvents = this.capacityAndAttendance(this.events)
                this.statsUpcoming = this.revenueAndAttendance(this.upcomingEvents)
                this.statsPast = this.revenueAndAttendance(this.pastEvents)

                this.auxEvents = this.events

                this.getCategories()

        }).catch(error => console.log(error))
    },

    methods: {
        getCategories(){
            this.categories = this.events.map(event => event.category)
            this.categories = new Set(this.categories)
        },
        filterByInput(eventsArr) {
            this.events = eventsArr.filter(event => event.name.toLowerCase().includes(this.search.toLowerCase()) || event.category.toLowerCase().includes(this.search.toLowerCase()))
        },
        capacityAndAttendance (eventsArr){
            let filterEvent = eventsArr.filter(event => event.assistance != undefined)
            let capacity = eventsArr.map(event => event.capacity)
            let maxCapacity = Math.max(...capacity)
            let eventMaxCapacity = eventsArr.find(event => event.capacity == maxCapacity)
            
            let attendancePer = filterEvent.map(event => event.assistance / event.capacity)
            let maxAttendancePer = Math.max(...attendancePer)
            let eventMaxAttendance = filterEvent.find(event => (event.assistance / event.capacity) == maxAttendancePer)
        
            let minAttendance = Math.min(...attendancePer)
            let eventMinAttendance = filterEvent.find(event => event.assistance / event.capacity == minAttendance)
            // 
            return [eventMaxAttendance,  eventMinAttendance, eventMaxCapacity]
        },
        revenueAndAttendance(eventsArr){
            let categories = new Set(eventsArr.map(event => event.category))
            let arrayStats = []
            categories.forEach(category => {
                let filterArr = eventsArr.filter(event => event.category == category)
                let revenues = filterArr.map(event => (event.assistance ?event.assistance :event.estimate) * event.price)
                let assistancePer = filterArr.map(event => (event.assistance ?event.assistance : event.estimate) / event.capacity)
                let totalRevenues = revenues.reduce((act, sig) => act = act + sig, 0)
                let perCategoryAtten = assistancePer.reduce((act, sig) => act = act+ sig, 0)
                arrayStats.push([category, totalRevenues, perCategoryAtten / filterArr.length])
            })
            return arrayStats
        },
        selectedLabel(event){
            let label = event.target
            if (label.classList.contains("label")){
                label.classList.toggle("selectedCheckbox")
            }
        },
        formatDate(date){
            eventDate = new Date(date)
            let options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            let eventDateFormatted = eventDate.toLocaleDateString('en-US', options).split(" ")
            return eventDateFormatted

        },
        addFade(event){
            if (event.animationName === 'fadeIn'){
                event.target.classList.add('did-fade-in')
            }
        },
        removeFade(event){
            if (event.animationName === 'fadeOut'){
                event.target.classList.remove('did-fade-in')
            }
        }

    },
    computed: {
        completedFilter(){

            if (this.selectedCheckboxs.length != 0){
                this.events = this.auxEvents.filter(event =>{
                    return this.selectedCheckboxs.includes(event.category)
                })
            }
            else {
                this.events = this.auxEvents
            }
            if (this.search !=""){
                this.filterByInput(this.events)
            }
        }
    }
}).mount("#app")
