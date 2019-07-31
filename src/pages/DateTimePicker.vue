<template>
    <div class="timepickerWrapper">
        {{dateRange}}
        <section class="demoSection">
            <DateTimePicker
                v-bind:date-range.sync="dateRange"
                :singleDate="singleDate"
                timeFormat="HH:mm"
            />
            <button @click="dateRange.startDate = new Date('2018-01-01 00:00:00')">Last year</button>
            <button @click="dateRange.endDate = new Date('2018-12-01 00:00:00')">full year</button>
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
                    startDate: new Date().getTime(),
                    endDate: new Date().getTime(),
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
        max-width: 600px;
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
