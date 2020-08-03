<script>
    import DateTimePickerModal from "./DateTimePickerModal.vue"
    import iconCalendar from "./Icons/Calendar.vue"
    import moment from 'moment'

    const BOX_LENGTH = 750 //px
    const BOX_HEIGHT = 510 //px
    const RWD_THRESHOLD_W = 700

    const _getDateString = (date, format = "YYYY MMM DD HH:mm A") => {
        if (!date) return ""
        return moment(date).format(format)
    }



    export default {
        name: "DateTimePicker",
        components: {
            DateTimePickerModal,
            iconCalendar
        },
        data() {
            return {
                isOpen: false,
                shiftMarginLeft: 0,
                shiftMarginHeight: 0
            }
        },
        props: {
            heatMapData: {
                type: Object,
                default: () => null
            },
            dateRange: {
                type: Object
            },
            clockAllowedMinutes: {
                type: Number,
                default: 1,
                required: false
            },
            min: null, // expects instance of Date
            max: null, // expects instance of Date
            defaultStartTime: {
                type: String,
                default: '00:00',
                required: false
            },
            defaultEndTime: {
                type: String,
                default: '23:59',
                required: false
            },
            format: {
                type: String,
                default: "YYYY MMM DD HH:mm A"
            },
            resetToDefaultTime: {
                type: Boolean,
                default: true
            },
            singleDate: {
                type: Boolean,
                default: false
            },
            clickOutside: {
                type: Boolean,
            },
            divider: {
                type: String,
                default: 'to'
            },
            onChange: Function
        },
        watch: {
            clickOutside: {
                handler() {
                    this.isOpen = false
                    this.$emit("isOpen", this.isOpen)
                }
            }
        },
        methods: {
            calculateShift: function () {
                const windowWidth = window.innerWidth
                const windowHeight = window.innerHeight

                const wrapper = this.$refs.wrapper

                const {x, y} = wrapper.getBoundingClientRect()

                const dx = windowWidth - x
                const isDesktop = windowWidth > RWD_THRESHOLD_W

                // calculate shift x
                if (dx < BOX_LENGTH && isDesktop) {
                    this.shiftMarginLeft = Math.min(BOX_LENGTH - dx, x)
                }

                // calculate shift y, has enough space
                if (y > windowHeight / 2 && windowHeight > 2 * BOX_HEIGHT && isDesktop) {
                    this.shiftMarginHeight = BOX_HEIGHT
                }

                // calculate shift y, has no enough space
                if (windowHeight < 2 * BOX_HEIGHT && isDesktop) {
                    const dy = windowHeight - y
                    this.shiftMarginHeight = Math.min(BOX_HEIGHT - dy, y)
                }
            },
            openHandler: function () {
                this.calculateShift()
                return (this.isOpen = !this.isOpen)
            },
            getDateString: function (data) {
                const {singleDate, format} = this
                const {startDate, endDate} = data
                return singleDate
                    ? _getDateString(startDate, format)
                    : `${_getDateString(startDate, format)} ${this.divider} ${_getDateString(
                        endDate,
                        format
                    )}`
            },
            callOnChange: function (returnData) {
                if (this.$listeners.onChange) {
                    return this.$emit("onChange", {...returnData})
                }

                if (this.onChange) {
                    return this.onChange({...returnData})
                }
            },
            submitHandler: function (data) {
                this.isOpen = false
                this.$emit('update:date-range', {
                    from: data.startDate.getTime(),
                    to: data.endDate.getTime(),
                })
            }
        },
        computed: {
            dateString: {
                get(){
                    const {startDate, endDate} = this
                    return this.getDateString({startDate, endDate})
                }
            },
            startDate(){
                return (typeof this.dateRange.from === 'object') ? this.dateRange.from : new Date(this.dateRange.from)
            },
            endDate(){
                return (typeof this.dateRange.to === 'object') ? this.dateRange.to : new Date(this.dateRange.to)
            },
        },
        // beforeMount() {
        //     let startDate = (typeof this.startDate === 'object') ? this.startDate : new Date(this.startDate)
        //     let endDate = (typeof this.endDate === 'object') ? this.endDate : new Date(this.endDate)
        //     this.selectedDate = { startDate, endDate }
        // }
    }
</script>

<template>
    <div class="dateTimePickerWrapper" ref="wrapper">
        <a
            :class="isOpen ? 'active' : ''"
            @click="openHandler"
            class="calendarTrigger"
        >
            <icon-calendar class="iconCalendar before"/>
            <input
                :value="dateString"
                class="calendarInput"
                readonly="readonly"
                type="text"
            />
            <icon-calendar class="iconCalendar after"/>
        </a>

        <date-time-picker-modal
            :min="min"
            :max="max"
            :format="format"
            :endDate="endDate"
            :startDate="startDate"
            :singleDate="singleDate"
            :defaultEndTime="defaultEndTime"
            :defaultStartTime="defaultStartTime"
            :resetToDefaultTime="resetToDefaultTime"
            :clock-allowed-minutes="clockAllowedMinutes"
            :class="{ fadeInDown: isOpen }"
            :heatMapData="heatMapData"
            :style="{
                marginLeft: `-${shiftMarginLeft}px`,
                marginTop: `-${shiftMarginHeight}px`
            }"
            @cancelHandler="isOpen = false"
            @submitHandler="submitHandler"
            v-if="isOpen"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "../style/main.scss";

    /* animation */
    @keyframes fadeInDown {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fadeInDown {
        animation: fadeInDown 0.6s ease both;
    }

    /* compomnent style */
    .dateTimePickerWrapper {
        position: relative;

        //modal
        .dateTimeWrapper {
            opacity: 0;
            left: 0;
            position: absolute;
            z-index: 198;
        }

        //trigger
        .calendarTrigger {
            position: relative;
            overflow: hidden;
            display: block;
            width: 100%;
            min-width: 300px;
            height: 50px;
            border-radius: 3px;
            background: #fff;
            border: 1px solid $silver-two;
            transition-duration: 1s;

            &:hover {
                border: 1px solid $secondary-01;

                .iconCalendar {
                    color: $secondary-01;
                }
            }

            &.active {
                border-color: $secondary-01;

                .iconCalendar {
                    color: $secondary-01;
                }
            }

            .calendarInput {
                background: #fff;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                color: $secondary-01;
                font-size: 16px;
                padding: 20px 20px 20px 50px;
                outline: none;
                z-index: 1;
                cursor: pointer;
            }

            .iconCalendar {
                position: absolute;
                z-index: 2;
                width: 50px;
                height: 50px;
                justify-content: center;
                align-items: center;
                display: flex;
                color: $silver;
            }
        }
    }
</style>
