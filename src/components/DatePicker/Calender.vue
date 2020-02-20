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
            substractDayPrevMonth(days) {
                const lastDayPrevMonth = new Date(new Date(this.year, this.month, 0).getTime()).getDate();
                return lastDayPrevMonth - days;
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
            updateSelectingDay: function (day, whichMonth = 'current') {
                if (!day) return;

                const {
                    year,
                    month,
                    innerStartDate,
                    innerEndDate,
                    isSelectingStartDay,
                } = this;

                const currentDay = new Date(`${year}-${month + 1}-${day}`);

                // reset
                if (
                    isSelectingStartDay ||
                    (!isSelectingStartDay && currentDay < innerStartDate)
                ) {
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

            getDayStyle: function (day) {
                const {innerStartDate, innerEndDate, year, month} = this;
                const currentDay = new Date(`${year}-${month + 1}-${day}`);

                if (utils.isSameDay(currentDay, innerStartDate)) return 'innerStartDate';
                if (utils.isSameDay(currentDay, innerEndDate)) return 'innerEndDate';
                if (isBetweenDays(innerStartDate, innerEndDate, currentDay))
                    return 'between';
                if (isToday(currentDay)) return 'today';

                return '';
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
                        class="nullBlock"
                        :class="getDayStyle(day,'prev')"
                        @click="updateSelectingSingleDay(day,'prev')"
                    >{{substractDayPrevMonth(day)}}
                    </span>
                </li>
            </template>
            <template v-for="(day, key) in daysCount">
                <li class="day" :key="'day' + key">
                    <span
                        v-if="!singleDate"
                        :class="getDayStyle(day)"
                        @click="updateSelectingDay(day)"
                    >{{ day }}
                    </span>
                    <span
                        v-if="singleDate"
                        :class="getDayStyle(day)"
                        @click="updateSelectingSingleDay(day)"
                    >{{ day }}
                    </span>
                </li>
            </template>
            <template v-if="!ignoreStartWeekDay" v-for="(day, key) in endWeekday">
                <li class="day" :key="'after' + key">
                    <span
                        class="nullBlock"
                        :class="getDayStyle(day,'next')"
                        @click="updateSelectingSingleDay(day,'next')"
                    >{{day}}
                    </span>
                </li>
            </template>
        </ul>
    </div>
</template>
<style lang="scss" scoped>
    @import "../../style/main.scss";

    ul.calendar {
        width: 364px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        background: #fff;

        li {
            display: inline-block;
            width: 52px;

            .nullBlock {
                opacity: 0.35;
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
