$(document).ready(function () {

    renderQuantity(url_api_product, $('#so-luong-mat-hang'))
    renderQuantity(url_api_categories, $('#so-luong-loai-mat-hang'))
    renderQuantity(url_api_client, $('#so-luong-khach-hang'))
    renderQuantity(url_api_order, $('#so-luong-don-hang'))

    reloadBarChart()
    renderBartChart('bayNgayGanDay')

    $('.thongke-option').on('change', function () {
        var tail = $('.thongke-option').val()
        reloadBarChart()
        renderBartChart(tail)
    })

    //Tải lại mỗi lần thay đổi dữ liệu biểu đồ thống kê
    function reloadBarChart() {
        $('.render-bar-chart').empty()
        $('.render-bar-chart').append('' +
            '<div class="chart">\n' +
            '     <canvas id="barChart"\n' +
            '        style="min-height: 250px; height: 500px; max-height: 500px; max-width: 100%;"></canvas>\n' +
            '</div>')
    }

    //Get data from json API render for bar chart
    function renderBartChart(tail) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: url_api_order + '/' + tail,
            success: function (data) {
                let labels = []
                let values = []
                for (var i in data) {
                    switch (tail) {
                        case 'thangTrongNam':
                            labels.push('Tháng ' + new Date(data[i].ngayDatHang).getMonth())
                            break
                        case 'ngayTheoThang':
                            labels.push(formatDate(data[i].ngayDatHang))
                            break
                        default:
                            labels.push(formatDate(data[i].ngayDatHang))
                            break
                    }
                    values.push(data[i].tongTien)
                }
                setLabelsAndDataChart(labels, values)
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

    //Hàm render số lượng mặt hàng, khách hàng, loại mặt hàng,....
    function renderQuantity(url_api, element) {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: url_api,
            success: function (data) {
                element.text(data.length)
            },
            error: function (err) {
                alert(err)
            }
        })
    }

    //Formate ngày tháng năm
    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [day, month, year].join('/');
    }

    //Render biểu đồ cột
    function setLabelsAndDataChart(labels, values) {
        /* ChartJS
                 * -------
                 * Here we will create a few charts using ChartJS
                 */

        //--------------
        //- AREA CHART -
        //--------------

        // Get context with jQuery - using jQuery's .get() method.
        var areaChartCanvas = $('#barChart').get(0).getContext('2d')

        var areaChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Tổng tiền (VND)',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: values
                }
            ]
        }

        var areaChartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false,
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false,
                    }
                }]
            }
        }


        //-------------
        //- BAR CHART -
        //-------------
        var barChartCanvas = $('#barChart').get(0).getContext('2d')
        var barChartData = $.extend(true, {}, areaChartData)
        var temp0 = areaChartData.datasets[0]

        barChartData.datasets[0] = temp0

        var barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            datasetFill: false
        }

        new Chart(barChartCanvas, {
            type: 'bar',
            data: barChartData,
            options: barChartOptions
        })

        //
        // //---------------------
        // //- STACKED BAR CHART -
        // //---------------------
        // var stackedBarChartCanvas = $('#stackedBarChart').get(0).getContext('2d')
        // var stackedBarChartData = $.extend(true, {}, barChartData)
        //
        // var stackedBarChartOptions = {
        //     responsive: true,
        //     maintainAspectRatio: false,
        //     scales: {
        //         xAxes: [{
        //             stacked: true,
        //         }],
        //         yAxes: [{
        //             stacked: true
        //         }]
        //     }
        // }

        // var chart = new Chart(stackedBarChartCanvas, {
        //     type: 'bar',
        //     data: stackedBarChartData,
        //     options: stackedBarChartOptions
        // })
    }

})
