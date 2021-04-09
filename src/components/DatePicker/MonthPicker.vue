<script>
import Arrow from '../Icons/Arrow.vue'
import moment from 'moment'

export default {
    components: {Arrow},
    props: {
        heatMapData: {
            type: Object,
            default: () => null
        },
        startDate: Date,
        endDate: Date,
        min: null, // expects instance of Date
        max: null, // expects instance of Date
        onChange: Function
    },
    data(){
        const { startDate, endDate } = this
        const _startDate = startDate ? startDate : new Date()
        const defaultCurrentMonth = _startDate.getMonth()
        const defaultCurrentYear = _startDate.getFullYear()
        return {
            isSelectingStartDay: true,
            currentYear: defaultCurrentYear,
            innerStartDate: _startDate,
            innerEndDate: endDate || utils.getDayAfter(_startDate, 2),
        }
    },
    computed: {
        months(){
            return [...Array(12).keys()].map((e, k) => {
                return moment().month(k).format('MMM')
            })
        }
    },
    methods: {
        prevYear(){
            if(this.canShift(-1)){
                this.currentYear--
            }
        },
        nextYear(){
            if(this.canShift(1)){
                this.currentYear++
            }
        },
        canShift(direction){
            if(direction < 0){
                return moment(this.min).year() < this.currentYear
            } else {
                return moment(this.max).year() > this.currentYear
            }
        },
        onClick(month){
            const { innerStartDate, isSelectingStartDay } = this;
            const d = moment().month(month).year(this.currentYear).startOf('month')
            if (isSelectingStartDay || (!isSelectingStartDay && d < innerStartDate)) {
                this.innerStartDate = new Date(d)
                this.isSelectingStartDay = false;
            } else {
                this.isSelectingStartDay = true;
            }
            this.innerEndDate = new Date(moment(d).endOf('month'))
            return this.callOnChange({
                startDate: new Date(moment(this.innerStartDate).startOf('month')),
                endDate: new Date(moment(d).endOf('isoWeek')),
            });
        },
        isMonthSelected(month){
            const d = moment().month(month).year(this.currentYear).startOf('month')
            if(d.isAfter(moment(this.max))){
                return false
            }
            return d.isBetween(moment(this.innerStartDate), moment(this.innerEndDate), undefined, '[)')
        },
        isMonthDisabled(month){
            return ! moment().month(month).year(this.currentYear).startOf('month')
                .isBetween(moment(this.min).startOf('month'), moment(this.max).endOf('month'), undefined, '[]')
        },
        callOnChange: function (returnData) {
            if (this.$listeners.onChange) {
                return this.$emit('onChange', {...returnData});
            }

            if (this.onChange) {
                return this.onChange({...returnData});
            }
        },
        getHeatMapColor(month){
            if(this.heatMapData){
                let value
                for (let k in this.heatMapData.dailyData) {
                    if(moment(k).month() === month && moment(k).year() === this.currentYear){
                        value = this.heatMapData.dailyData[k]
                        break
                    }
                }
                if(value){
                    const min = Math.min(...Object.values(this.heatMapData.dailyData))
                    const max = Math.max(...Object.values(this.heatMapData.dailyData))
                    const rgb = this.rgb(
                        min,
                        max,
                        max - value
                    )
                    return { ...rgb, value, color: `rgba(${rgb.r},${rgb.g},${rgb.b}, 1)` }
                }
            }
            return { color: 'rgba(0,0,0,0)', value: null, r: 0, g: 0, b: 0, a: 0 }
        },
        rgb(minimum, maximum, value){
            const ratio = 2 * (value-minimum) / (maximum - minimum)
            // let b = Math.floor(Math.max(0, 255 * (1 - ratio)))
            let b = 0
            let r = Math.floor(Math.max(0, 255 * (1 - ratio)))
            let g = (255 - b - r) * 1.5
            return { r, g, b }
        }
    }
}
</script>
<template>
    <div>
        <div class="datePicker_wrap">
            <div class="calendar-header">
                <span
                    @click="prevYear"
                    class="arrow icon-left"
                    :class="{
                        'arrow--disabled': !canShift(-1)
                    }"
                > <arrow /> </span>
                <h3>
                    <span class="currentYear">{{ currentYear }}</span>
                </h3>
                <span
                    @click="nextYear"
                    class="arrow icon-right"
                    :class="{
                        'arrow--disabled': !canShift(1)
                    }"
                >
                    <arrow />
                </span>
            </div>
        </div>
        <div class="months__container">
            <div
                v-for="(month, k) in months"
                class="month"
                :class="{
                    'month--disabled': isMonthDisabled(k),
                    'month--selected': isMonthSelected(k)
                }"
                :style="{
                    borderColor: getHeatMapColor(k).color
                }"
                @click="onClick(k)"
            >
                {{ month }}
            </div>
        </div>
    </div>
</template>
<style lang="sass" scoped>
    .arrow
        &--disabled
            opacity: .3
            pointer-events: none

    .months__container
        display: grid
        grid-template-columns: repeat(3, minmax(0, 1fr))
        grid-template-rows: repeat(3, minmax(0, 1fr))
        margin-bottom: 1em
        .month
            padding: 8px
            text-align: center
            cursor: pointer
            position: relative
            &:hover
                background-color: #3e82ff
            &--selected
                background-color: #6a9cf6
            &--disabled
                opacity: .3
                pointer-events: none
            &::after
                border-bottom: 5px solid
                border-color: inherit
                content: ''
                position: absolute
                bottom: 0
                left: 0
                width: calc(100% - 0px)
</style>
