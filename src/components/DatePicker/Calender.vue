<script>
    import utils from '../../lib/date';

    const isToday = otherDay => {
        const today = new Date();
        return utils.isSameDay(today, otherDay);
    };

    const isBetweenDays = (smallDay, bigDay, currentDay) => {
        if (currentDay < bigDay && smallDay < currentDay) return true;
        return false;
    };

    export default {
        name: 'Calender',
        props: {
            year: Number,
            month: Number,
            startDate: Date,
            endDate: Date,
            onChange: Function,
            singleDate: {
                type: Boolean,
                default: false,
            },
            ignoreStartWeekDay: {
                type: Boolean,
                default: false,
            },
            min: null, // expects instance of Date
            max: null, // expects instance of Date
        },
        methods: {
            callOnChange: function (returnData) {
                if (this.$listeners.onChange) {
                    return this.$emit('onChange', {...returnData});
                }

                if (this.onChange) {
                    return this.onChange({...returnData});
                }
            },
            updateSelectingSingleDay: function (day) {

                if (!day) return;

                const {year, month, innerStartDate, innerEndDate} = this;
                const currentDay = new Date(`${year}-${month + 1}-${day}`);

                this.innerStartDate = currentDay;
                this.innerEndDate = currentDay;
                this.selectedDay = day;
                return this.callOnChange({
                    selectedDay: currentDay,
                    startDate: this.innerStartDate,
                });
            },
            substractDayPrevMonth(days) {
                const lastDayPrevMonth = new Date(new Date(this.year, this.month, 0).getTime()).getDate();
                return lastDayPrevMonth - days;
            },
            getSelectedDayDateObject(day, whichMonth = 'current'){
                let y = null
                let m = null

                switch(whichMonth){
                    case 'prev':
                        y = this.month === 0 ? this.year - 1 : this.year
                        m = this.month === 0 ? 12 : this.month
                        return new Date(`${y}-${m}-${this.substractDayPrevMonth(day)}`);
                    case 'current':
                        return new Date(`${this.year}-${this.month + 1}-${day}`);
                    case 'next':
                        y = this.month === 11 ? this.year + 1 : this.year
                        m = this.month === 11 ? 1 : this.month + 2
                        return new Date(`${y}-${m}-${day}`);
                }
            },
            updateSelectingDay: function (day, whichMonth = 'current') {
                const { innerStartDate, isSelectingStartDay } = this;
                const currentDay = this.getSelectedDayDateObject(day, whichMonth);

                // reset
                if (isSelectingStartDay || (!isSelectingStartDay && currentDay < innerStartDate)) {
                    this.innerStartDate = currentDay;
                    this.isSelectingStartDay = false;
                } else {
                    this.isSelectingStartDay = true;
                }

                this.innerEndDate = currentDay;
                this.selectedDay = day;

                return this.callOnChange({
                    selectedDay: currentDay,
                    startDate: this.innerStartDate,
                    endDate: this.innerEndDate,
                });
            },

            getDayStyle: function (day, whichMonth = 'current') {
                const {innerStartDate, innerEndDate, year, month} = this;
                const currentDay = this.getSelectedDayDateObject(day, whichMonth);

                if (utils.isSameDay(currentDay, innerStartDate)) return 'innerStartDate';
                if (utils.isSameDay(currentDay, innerEndDate)) return 'innerEndDate';
                if (isBetweenDays(innerStartDate, innerEndDate, currentDay)) return 'between';
                if (isToday(currentDay)) return 'today';

                return '';
            },
            betweenMinMax: function (day, whichMonth = 'current') {
                if(this.singleDate){
                    return false
                } else if(this.min && this.max) {
                    const currentDay = this.getSelectedDayDateObject(day, whichMonth);
                    return currentDay.getTime() >= this.min.getTime() && currentDay.getTime() <= this.max.getTime()
                }
            },
        },
        computed: {
            startWeekday: function () {
                const weekday = utils.getWeekday(
                    new Date(`${this.year}-${this.month + 1}-01`).getTime(),
                );
                const a = [];
                let i;
                for (i = 1; i < weekday; i++) {
                    a.push(weekday - 1 - i);
                }
                return weekday === 0 ? [5, 4, 3, 2, 1, 0] : a;
            },
            endWeekday: function () {
                const weekday = new Date(new Date(this.year, this.month + 1, 0).getTime()).getDay();
                return weekday > 0 ? 7 - weekday : 0;
            },
            daysCount: function () {
                return utils.daysInMonth(this.year, this.month);
            },
        },
        data() {
            const {month, startDate, endDate, singleDate} = this;
            return {
                selectedDay: null,
                isSelectingStartDay: true, // either startDay or endDay
                weekdays: utils.weekDayShortConfig,
                innerStartDate: startDate,
                innerEndDate: singleDate ? startDate : endDate,
            };
        },
    };
</script>

<template>
    <div>
        <ul class="calendar">
            <template v-for="(weekday, key) in weekdays">
                <li class="weekday" :key="'weekday' + key">
                    <span>{{ weekday }}</span>
                </li>
            </template>
            <template v-if="!ignoreStartWeekDay" v-for="(day, key) in startWeekday">
                <li class="day" :key="'before' + key">
                    <span
                        v-if="betweenMinMax(day,'prev')"
                        class="nullBlock"
                        :class="getDayStyle(day,'prev')"
                        @click="updateSelectingDay(day,'prev')"
                    >
                        {{substractDayPrevMonth(day)}}
                    </span>
                    <span
                        v-else-if="!singleDate"
                        class="nullBlock disabled"
                    >
                        {{substractDayPrevMonth(day)}}
                    </span>
                </li>
            </template>
            <template v-for="(day, key) in daysCount">
                <li class="day" :key="'day' + key">
                    <span
                        v-if="betweenMinMax(day,'current')"
                        :class="getDayStyle(day)"
                        @click="updateSelectingDay(day)"
                    >
                        {{ day }}
                    </span>
                    <span
                        v-else-if="!singleDate"
                        class="disabled"
                        :class="getDayStyle(day)"
                    >
                        {{ day }}
                    </span>
                    <span
                        v-else="singleDate"
                        :class="getDayStyle(day)"
                        @click="updateSelectingSingleDay(day)"
                    >
                        {{ day }}
                    </span>
                </li>
            </template>
            <template v-if="!ignoreStartWeekDay" v-for="(day, key) in endWeekday">
                <li class="day" :key="'after' + key">
                    <span
                        v-if="betweenMinMax(day,'next')"
                        class="nullBlock"
                        :class="getDayStyle(day,'next')"
                        @click="updateSelectingDay(day,'next')"
                    >
                        {{day}}
                    </span>
                    <span
                        v-else-if="!singleDate"
                        class="nullBlock disabled"
                    >
                        {{day}}
                    </span>
                </li>
            </template>
        </ul>
    </div>
</template>
<style lang="scss" scoped>
    @import "../../style/main.scss";

    ul.calendar {
        width: 372px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        background: #fff;

        li {
            display: inline-block;
            width: calc(100% / 7);

            .nullBlock {
                opacity: 0.75;
            }
            .disabled {
                background-color: lightgray !important;
                color: rgba(82, 88, 98, 0.4) !important;
                cursor: default !important;
            }
        }

        li.weekday {
            font-size: 14px;
            color: $silver;
            font-weight: 600;
            margin-bottom: 8px;
            text-align: center;
        }

        li.day {
            span {
                width: 100%;
                height: 40px;
                display: inline-block;
                text-align: center;
                line-height: 40px;
                font-size: 15px;
                font-weight: 600;
                color: $slate-grey;
                background: #fff;

                &:hover {
                    cursor: pointer;
                    color: #fff;
                    background: $secondary-01;
                    transition-duration: 0.3s;
                }

                &.today {
                    box-shadow: inset 0 0 0 2px $secondary-01;
                }

                &.innerStartDate {
                    background: $secondary-01;
                    color: #fff;
                }

                &.innerEndDate {
                    background: $secondary-01;
                    color: #fff;
                }

                &.between {
                    background: #eaf0fd;
                }
            }
        }
    }

    @media only screen and (max-width: 700px) {
        ul.calendar {
            width: 100%;

            li {
                width: calc(100% / 7);
            }
        }
    }
</style>
