<template>
    <div class="timepickerWrapper">
        {{dateRange}}
        <section class="demoSection">
            <DateTimePicker
                v-bind:date-range.sync="dateRange"
                :singleDate="singleDate"
                :min="new Date('2019-10-15 01:12:00')"
                :max="new Date('2020-03-15 15:00:00')"
                :reset-to-default-time="true"
                default-start-time="00:00"
                default-end-time="23:59"
                format="YYYY MMM DD HH:mm A"
            />
            <button @click="dateRange.from = new Date('2018-01-01 00:00:00').getTime()">Last year</button>
            <button @click="dateRange.to = new Date('2018-12-01 00:00:00').getTime()">full year</button>
        </section>

        <section class="resultSection">
            <h2>Result</h2>
            <div class="exampleWrapper">
                <pre v-highlightjs="resultString"><code class="javascript"></code></pre>
            </div>
        </section>
    </div>
</template>

<script>
    import DateTimePicker from "../components/DateTimePicker"
    export default {
        name: "time-picker-page",
        methods: {
            submitHandler: function (data) {
                console.log("data: ", data)
            },
            cancelHandler: function () {
                console.log("close")
            }
        },
        components: {
            DateTimePicker
        },
        computed: {
            resultString: function () {
                return JSON.stringify(this.dateTimePickerValue, null, 4)
            }
        },
        data: function () {
            return {
                singleDate: false,
                dateTimePickerValue: "",
                dateRange: {
                    from: new Date().getTime(),
                    to: new Date().getTime(),
                }
            }
        },
        mounted() {

        }
    }
</script>

<style lang="scss" scoped>
    .timepickerWrapper {
        width: 100%;
        max-width: 800px;
        margin: auto;
        margin-top: 300px;

        .demoSection {
            width: 200px;
            margin: auto;
        }

        .resultSection {
            margin-top: 20px;
            text-align: left;
        }

        .sampleSection {
            margin-top: 20px;
            text-align: left;

            .exampleWrapper {
                padding: 20px;
                background: #eeeeee;
            }
        }

        h2 {
            line-height: 2.5;
        }
    }
</style>
