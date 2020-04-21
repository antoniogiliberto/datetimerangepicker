<script>
    import TimePicker from './TimePicker/index.vue';
    import DatePicker from './DatePicker/index.vue';
    import utils from '../lib/date';
    import {getTimeObjectFromDate} from '../lib/time';
    import Times from "./Icons/Times";

    export default {
        name: 'DateTimePickerModal',
        components: {
            DatePicker,
            TimePicker,
            Times,
        },
        data() {
            const today = new Date();
            const {
                startDate = today,
                endDate = utils.getDayAfter(today, 2),
                defaultStartTime,
                defaultEndTime
            } = this;

            const startTime = getTimeObjectFromDate(startDate, 'HH:mm');
            const endTime = getTimeObjectFromDate(endDate, 'HH:mm');

            return {
                showClock: false,
                clickedTimeField: null,
                modelTimepicker: null,
                modelInnerStartTime: `${startTime.HH}:${startTime.mm}` || defaultStartTime,
                modelInnerEndTime: `${endTime.HH}:${endTime.mm}` || defaultEndTime,
                innerStartDate: startDate,
                innerEndDate: endDate,
            };
        },
        props: {
            submitHandler: Function,
            startDate: Date,
            endDate: Date,
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
            resetToDefaultTime: {
                type: Boolean,
                default: false,
            },
            singleDate: {
                type: Boolean,
                default: false,
            },
            showDial: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            modelTimepicker(time){
                this[`modelInner${this.clickedTimeField}Time`] = time
            },
        },
        methods: {
            allowedStep: function(m) {
                return m % this.clockAllowedMinutes === 0
            },
            callEvent: function (eventName, data) {
                if (this.$listeners[eventName]) {
                    return this.$emit(eventName, data);
                }
                if (this[eventName]) {
                    return this[eventName](data);
                }
            },
            __onChange: function (data) {
                if (this.resetToDefaultTime) {
                    this.modelInnerStartTime = this.defaultStartTime;
                    this.modelInnerEndTime = this.defaultEndTime;
                }
                return this.singleDate
                    ? this._onChangeSingleDate(data)
                    : this._onChangeMultiDate(data);
            },
            __onSubmit: function () {
                return this.singleDate
                    ? this._submitSingleHandler()
                    : this._submitMultiHandler();
            },
            getShortMonth: function (monthIndex) {
                return utils.monthShortConfig[monthIndex];
            },
            __onCancel: function () {
                return this.callEvent('cancelHandler');
            },
            _submitSingleHandler: function () {
                const {innerStartTime: startTime, innerEndTime: endTime} = this;
                const {innerStartDate: startDate} = this.$refs.datePickerRef;
                const startDateString = utils.format(startDate, 'yy-mm-dd');
                const startTimeString = `${startTime.HH || '00'}:${startTime.mm || '00'}`;
                const startDateObject = new Date(`${startDateString}T${startTimeString}`);
                const returnData = {
                    startDate: startDateObject,
                    startTime,
                };
                return this.callEvent('submitHandler', returnData);
            },
            _submitMultiHandler: function () {
                const {
                    innerStartDate: startDate,
                    innerEndDate: endDate,
                } = this.$refs.datePickerRef;

                const startDateString = utils.format(startDate, 'yy-mm-dd');
                const endDateString = utils.format(endDate, 'yy-mm-dd');
                const startDateObject = new Date(`${startDateString}T${this.modelInnerStartTime}`);
                const endDateObject = new Date(`${endDateString}T${this.modelInnerEndTime}`);
                const s = this.modelInnerStartTime.split(':');
                const e = this.modelInnerEndTime.split(':');

                const returnData = {
                    startDate: startDateObject,
                    endDate: endDateObject,
                    startTime: {HH: s[0], mm: s[1]},
                    endTime: {HH: e[0], mm: e[1]},
                };

                return this.callEvent('submitHandler', returnData);
            },
            _onChangeMultiDate: function (data) {
                const {startDate, endDate} = data;
                this.innerStartDate = startDate;
                this.innerEndDate = endDate;
            },
            _onChangeSingleDate: function (data) {
                const {startDate} = data;
                this.innerStartDate = startDate;
            },
        },
    };
</script>

<template>

    <div class="dateTimeWrapper">
        <div class="containerWrapper">
            <div class="dateContainer">
                <DatePicker
                    ref="datePickerRef"
                    :startDate="innerStartDate"
                    :endDate="innerEndDate"
                    :min="min"
                    :max="max"
                    @onChange="__onChange"
                    :singleDate="singleDate"
                />
            </div>
            <div class="timeContainer" v-if="showDial">
                <v-container fluid data-app>
                    <v-row v-if="!showClock" class="startTime timeRow">
                        <span class="subTitle">From</span>
                        <div>
                            <span class="bigNumber">{{ innerStartDate.getDate() }}</span>
                            {{ getShortMonth(innerStartDate.getMonth()) }}
                            {{ innerStartDate.getFullYear() }}
                        </div>
                        <v-text-field
                            v-model="modelInnerStartTime"
                            dense
                            label="Start time"
                            outlined
                            readonly
                            @click="showClock = true, clickedTimeField = 'Start'"
                        />
                    </v-row>
                    <v-row v-if="!showClock" class="endTime timeRow">
                        <span class="subTitle">To</span>
                        <div>
                            <span class="bigNumber">{{ innerEndDate.getDate() }}</span>
                            {{ getShortMonth(innerEndDate.getMonth()) }}
                            {{ innerEndDate.getFullYear() }}
                        </div>
                        <v-text-field
                            v-model="modelInnerEndTime"
                            dense
                            label="End time"
                            outlined
                            readonly
                            @click="showClock = true, clickedTimeField = 'End'"
                        />
                    </v-row>
                    <v-row v-else>
                        <v-row no-gutters>
                            <v-spacer />
                            <v-btn
                                text
                                icon
                                ripple
                                small
                                class="times"
                                @click="showClock = false"
                            >
                                <span class="icon"> <times /> </span>
                            </v-btn>
                        </v-row>
                        <v-time-picker
                            no-title
                            format="24hr"
                            :allowed-minutes="allowedStep"
                            v-model="modelTimepicker"
                            @click:minute="showClock = false"
                        />
                    </v-row>
                </v-container>
            </div>
            <div class="timeContainer" v-else>
                <div class="startTime timeRow">
                    <span class="subTitle">From</span>
                    <div>
                        <span class="bigNumber">{{ innerStartDate.getDate() }}</span>
                        {{ getShortMonth(innerStartDate.getMonth()) }}
                        {{ innerStartDate.getFullYear() }}
                    </div>
                    <time-picker
                            :format="timeFormat"
                            :minute-interval="5"
                            v-bind:value="defaultStartTime"
                            @change="_onChangeTimeStart"
                    />
                </div>
                <div class="endTime timeRow" v-if="!singleDate">
                    <span class="subTitle">To</span>
                    <div>
                        <span class="bigNumber">{{ innerEndDate.getDate() }}</span>
                        {{ getShortMonth(innerEndDate.getMonth()) }}
                        {{ innerEndDate.getFullYear() }}
                    </div>
                    <time-picker
                            :format="timeFormat"
                            :minute-interval="5"
                            v-bind:value="defaultEndTime"
                            @change="_onChangeTimeEnd"
                    />
                </div>
            </div>
        </div>
        <div class="buttonWrap">
            <a class="confirm" @click.stop.prevent="__onSubmit">submit</a>
            <a class="cancel" @click.stop.prevent="__onCancel">cancel</a>
        </div>
    </div>

</template>
<style lang="scss" scoped>
    @import "../style/main.scss";

    .dateTimeWrapper {
        max-width: 768px;
        background: #fff;
        box-shadow: 0 20px 50px rgba(183, 185, 188, 0.35);

        .containerWrapper {
            display: flex;
            padding: 40px 30px 20px 30px;

            .dateContainer {
                padding: 0 30px;
                border-right: 1px solid $pale-grey-two;
            }

            .timeContainer {
                padding: 0;
                width: 300px;

                .times {
                    position: absolute;
                    z-index: 10;
                    right: 30px;
                    top: 60px;
                    .icon {
                        margin-top: 4px;
                    }
                }

                .timeRow {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                    padding: 15px 0;

                    .subTitle {
                        font-size: 13px;
                        color: $bluey-grey;
                    }

                    .bigNumber {
                        font-size: 34px;
                        letter-spacing: 3px;
                        line-height: 45px;
                        color: $secondary-01;
                        font-weight: 100;
                    }
                }
            }
        }

        .buttonWrap {
            display: flex;
            width: 100%;
            flex-direction: row-reverse;
            padding: 20px 60px 40px 0;
            border-top: 1px solid $pale-grey;

            a {
                padding: 0 30px;
                height: 44px;
                line-height: 44px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 700;
                text-transform: uppercase;
                margin: 0 0px;
                letter-spacing: 1px;

                &:hover {
                    outline: none;
                }

                &.confirm {
                    color: #fff;
                    background: $primary-01;
                }

                &.cancel {
                    color: $bluey-grey;
                }
            }
        }
    }

    @media only screen and (max-width: 700px) {
        .dateTimeWrapper {
            width: 100%;

            .containerWrapper {
                display: block;

                .dateContainer {
                    margin-bottom: 40px;
                    border-right: none;

                    .datePicker_wrap {
                        ul.calendar {
                            li {
                                width: 70px;
                            }
                        }
                    }
                }
            }
        }
    }

    @media only screen and (max-width: 480px) {
        .dateTimeWrapper {
            .containerWrapper {
                .dateContainer,
                .timeContainer {
                    padding: 0;

                    .timeRow {
                        padding: 8px 0;
                    }
                }
            }

            .buttonWrap {
                padding: 20px 30px 30px 0;
            }
        }
    }
</style>
