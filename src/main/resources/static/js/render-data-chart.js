$(document).ready(function () {

    renderQuantity(url_api_product, $('#so-luong-mat-hang'))
    renderQuantity(url_api_categories, $('#so-luong-loai-mat-hang'))
    renderQuantity(url_api_client, $('#so-luong-khach-hang'))
    renderQuantity(url_api_order, $('#so-luong-don-hang'))

    reloadBarChart()
    renderBartChart('bayNgayGanDay')

    reloadDonutChart()
    renderDonutChart('today')

    $('.thongke-doanhthu-option').on('change', function () {
        var tail = $('.thongke-doanhthu-option').val()
        reloadBarChart()
        renderBartChart(tail)
    })

    $('.thongke-mathang-option').on('change', function () {
        var tail = $('.thongke-mathang-option').val()
        reloadDonutChart()
        renderDonutChart(tail)
    })

    //Tải lại mỗi lần thay đổi dữ liệu biểu đồ thống kê
    function reloadBarChart() {
        $('.render-bar-chart').empty()
        $('.render-bar-chart').append('' +
            '<div class="chart">\n' +
            '     <canvas id="barChart"\n' +
            '        style="min-height: 250px; height: 330px; max-height: 330px; max-width: 100%;"></canvas>\n' +
            '</div>')
    }

    function reloadDonutChart() {
        $('.render-donut-chart').empty()
        $('.render-donut-chart').append('' +
            '     <canvas id="donutChart"\n' +
            '        style="min-height: 250px; height: 330px; max-height: 330px; max-width: 100%;"></canvas>\n')
    }

    //Get data from json API render for bar chart
    function renderBartChart(tail) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: url_api_order + '/' + tail,
            success: function (data) {

                if (data.length == 0) {

                    $('.render-bar-chart').empty()
                    $('.render-bar-chart').append('' +
                        '<div class="chart text-center mt-3">\n' +
                        '     <p>Chưa có dữ liệu để hiển thị</p>' +
                        '</div>')

                } else {
                    let labels = []
                    let values = []
                    for (var i in data) {
                        switch (tail) {
                            case 'thangTrongNam':
                                labels.push('Tháng ' + (new Date(data[i].ngayDatHang).getMonth() + 1))
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
                    setLabelsAndDataBarChart(labels, values)
                }

            },
            error: function (err) {
                console.log(err)
            }
        })
    }

    function renderDonutChart(tail) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: url_api_product + '/' + tail,
            success: function (data) {

                if (data.length == 0) {

                    $('.render-donut-chart').empty()
                    $('.render-donut-chart').append('' +
                        '<div class="chart text-center mt-3">\n' +
                        '     <p>Chưa có dữ liệu để hiển thị</p>' +
                        '</div>')

                } else {

                    let labels = []
                    let values = []
                    let colors = []
                    for (var i in data) {
                        labels.push(data[i].tenMH)
                        values.push(data[i].donGia)
                    }
                    for(var i = 0; i < data.length; i++){
                        const randomColor = Math.floor(Math.random() * 16777215).toString(16)
                        colors.push('#' + randomColor)
                    }

                    setLabelsAndDataDonutChart(labels, values, colors)

                }

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
    function setLabelsAndDataBarChart(labels, values) {
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
    }

    //Render biểu đồ donut
    function setLabelsAndDataDonutChart(labels, values, clrs) {
        //-------------
        //- DONUT CHART -
        //-------------
        // Get context with jQuery - using jQuery's .get() method.
        var donutChartCanvas = $('#donutChart').get(0).getContext('2d')
        var donutData = {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: clrs,
                }
            ]
        }
        var donutOptions = {
            maintainAspectRatio: false,
            responsive: true,
        }
        //Create pie or douhnut chart
        // You can switch between pie and douhnut using the method below.
        new Chart(donutChartCanvas, {
            type: 'doughnut',
            data: donutData,
            options: donutOptions
        })
    }

})
