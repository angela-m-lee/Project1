var indexs = [];
var pastIndexPrices = [];
function localStoragePull() {

    $('tbody').empty();

    // Pull the button information and NYT Articles from localStorage with the function calls
    // indexs/pastIndexPrices equal the parsed data from LocalStorage
    indexs = JSON.parse(localStorage.getItem('indexData')) || [];
    pastIndexPrices = JSON.parse(localStorage.getItem('purchasePrice')) || [];
    currentValue = JSON.parse(localStorage.getItem('currentValue'));
    for (var x = 0; x < indexs.length; x++) {
        var row = $('<tr>');
        var tbody = $('tbody');
        var date = $('<td>').append(indexs[x].date);
        var baseline = $('<td>').append(indexs[x].baseline);
        var percent = $('<td>').append((((currentValue - indexs[x].baseline) / indexs[x].baseline) * 100).toFixed(3) + ' %');
        var deleteButton = $('<td>').append($('<button>', {
            html: '<i class="trash icon"></i>',
            class: 'ui icon button negative',
            attr: 'data-index', x,
            click: function myDeleteFunction() {
                currentIndex = $(this).attr('data-index');
                pastIndexPrices.splice(currentIndex, 1);
                indexs.splice(currentIndex, 1);
                localStorage.setItem('purchasePrice', JSON.stringify(pastIndexPrices));
                localStorage.setItem('indexData', JSON.stringify(indexs));
                localStoragePull();
            }
        }));

        row.append(date);
        row.append(baseline);
        row.append(percent);
        row.append(deleteButton);
        tbody.append(row);
    }
}
var searches = [];
function renderButtons() {
    $("#topicButtons").empty();

    // Looping through the array of searches
    for (var i = 0; i < searches.length; i++) {
        var searchButtons = $('<button>', {
            class: 'ui button'
        })
        var searchTrashButton = $('<button>', {
            html: '<i class="trash icon"></i>',
            class: 'ui button',
            attr: 'data-index', i,
            click: function myTrashFunction() {
                currentIndex = $(this).attr('data-index');
                indexs.splice(currentIndex, 1);
                localStorage.setItem('indexData', JSON.stringify(searches));
                renderButtons();
            }
        });
        // Then dynamicaly generating buttons for each topic in the array
        searchButtons.append(searchTrashButton);
        $('#topicButtpns').append(searchButtons);
    }
}
$(document).ready(function () {
    // ON PAGE LOAD, SET THE CURRENT VALUE ALWAYS
    $.ajax({
        url: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPX&interval=1min&apikey=FKRKPA78COC2GQDQ',
        method: 'GET'
    }).then(function (response) {
        var lastRefresh = response['Meta Data']['3. Last Refreshed'];
        var currentValue = response['Time Series (1min)'][lastRefresh]['4. close'];
        $('#currentPrice').text('').append(currentValue);
        localStorage.setItem('currentValue', JSON.stringify(currentValue));
        localStoragePull();

        //function that creates the new index
        $('#buyButton').on('click', function (event) {
            // Prevents that event from happening before button is clicked.
            event.preventDefault();
            const apiKey = 'FKRKPA78COC2GQDQ';
            // Creating the URL for AlphaVantage
            var alphaURL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPX&interval=1min&apikey=' + apiKey;
    
            $.ajax({
                url: alphaURL,
                method: 'GET'
            }).then(function (response) {
                // Setting currentValue to equal Index Price. 
                var lastRefresh = response['Meta Data']['3. Last Refreshed'];
                var currentValue = response['Time Series (1min)'][lastRefresh]['4. close'];

                pastIndexPrices.push(currentValue);
                // creating the object everytime it's clicked
                var index = {
                    'date': lastRefresh,
                    'baseline': currentValue,
                };
                // pushing the index OBJECT to the indexs ARRAY
                indexs.unshift(index);
                // Saving to LocalStorage
                localStorage.setItem('indexData', JSON.stringify(indexs));
                localStorage.setItem('purchasePrice', JSON.stringify(pastIndexPrices));
                localStorage.setItem('currentValue', JSON.stringify(currentValue));
                localStoragePull();

                // Get the Ajax call and then append the current value of the Index Price to the div so it shows the current price on Page.
                $('#currentPrice').text('').append(currentValue);
            })
        });

        // -----------------------------------------------------------------------------------------------------------
        // CODE FOR THE NEWS AREA BELOW!

        // Initial array of news topics
        var newsTopics = ["market", "interest"];
        var newDivs = [];

        // Function for dumping the JSON content for each button into the div
        function displayNewsTopics() {

            var topic = $(this).attr("data-name");
            console.log("here");
            var queryURL = 'https://newsapi.org/v2/everything?q=' + topic + '&apiKey=2820b40a103f4ac58cda4ba7df6cf3d9';

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                $("#newsArea").text(response);
                console.log(response);
            });
        }

        function renderButtons() {

            // Deleting the buttons prior to adding new topics
            // (this is necessary otherwise you will have repeat buttons)
            newsTopics = JSON.parse(localStorage.getItem('newsTopics')) || [];

            $("#topicButtons").empty();

            // Looping through the array of newsTopics
            for (var i = 0; i < newsTopics.length; i++) {

                // Then dynamically generating buttons for each movie in the array
                var newDiv = $('<div>').attr("class", "ui icon buttons").attr("data-index", i);

                var a = $("<button>");
                // Adding a class of grey to our button
                a.attr("class", "ui grey button");
                // Adding a data-attribute
                a.attr("data-name", newsTopics[i]);
                // Providing the initial button text
                a.text(newsTopics[i]);
                // Adding the button to the buttons-view div
                trashButton = $('<button>').html("<i class = 'trash icon'></i>").attr("class", "ui button negative").attr("data-index", i).attr("id", "trashIt");

                // creating a local storage for divs
                newDiv.append(a);
                newDiv.append(trashButton);
                $("#topicButtons").append(newDiv);
                newDivs.push(newDiv);
                localStorage.setItem('newsDivs', JSON.stringify(newDivs));
            }
        };

        // Trash function
        function trash() {
            event.preventDefault();
            newDivs = JSON.parse(localStorage.getItem('newsDiv')) || [];
            newsTopics = JSON.parse(localStorage.getItem('newsTopics')) || [];
            currentNews = $(this).attr('data-index');
            currentDiv = $(this).attr('data-index');
            newDivs.splice(currentDiv, 1);
            newsTopics.splice(currentNews, 1);
            localStorage.setItem('newsDivs', JSON.stringify(newDivs));
            localStorage.setItem('newsTopics', JSON.stringify(newsTopics));
            $("#newsArticles").text('');
            renderButtons();
        };

        function newsGet() {
            $("#newsArea").text('');
            topic = $(this).attr('data-name');
            $.ajax({
                url: 'https://newsapi.org/v2/everything?q=' + topic + '&apiKey=2820b40a103f4ac58cda4ba7df6cf3d9',
                method: 'GET'
            }).then(function (response) {
                var articleCount = 5;

                for (var j = 0; j < articleCount; j++) {
                    var article = response.articles[j];
                    var $articleList = $("<ul>");
                    $articleList.addClass("list-group");
                    var newsArea = $("#newsArea").append($articleList);
                    var headline = article.title;
                    var $articleListItem = $("<li class='list-group-item articleHeadline'>");

                    // Gets the title and link and appends to newsArea
                    if (headline) {
                        $articleListItem.append(
                            "<strong> " +
                            headline +
                            "</strong>" +
                            "<br>" +
                            "<br>" 
                        );
                    }


                    var url = article.url;
                    var pFour = $("<p>").text("url:" + url);

                    $articleList.append($articleListItem);

                    $articleListItem.append("<a href='" + article.url + "'>" + article.url + "</a>");
                }

            });

            renderButtons()

        }


        // This function handles events where one button is clicked
        $("#add-topic").on("click", function (event) {
            event.preventDefault();

            // This line grabs the input from the textbox
            var topic = $("#topic-input").val().trim();

            // Adding the topic from the textbox to our array
            newsTopics.push(topic);

            // Calling renderButtons which handles the processing of our newstopic array
            renderButtons();
        })






        // Function for displaying the newsTopic info
        // Using $(document).on instead of $(".topic").on to add event listeners to dynamically generated elements
        $(document).on("click", ".topic", displayNewsTopics);
        $(document).on("click", "#trashIt", trash);
        $(document).on("click", ".grey", newsGet);


        // Calling the renderButtons function to display the initial buttons
        renderButtons();


        $("#newsArea").text('');
        // code for the SEARCH BOX on CLICK.
        $('#submit').on('click', function (event) {
            event.preventDefault();
            // This line grabs the input from the textbox
            var topic = $('#topicInput').val().trim();
            $("#newsArea").text('');
            $.ajax({
                url: 'https://newsapi.org/v2/everything?q=' + topic + '&apiKey=2820b40a103f4ac58cda4ba7df6cf3d9',
                method: 'GET'
            }).then(function (response) {
                var articleCount = 5;

                $("#newsArticles").text('')
                for (var j = 0; j < articleCount; j++) {
                    var article = response.articles[j];
                    var $articleList = $("<ul>");
                    $articleList.addClass("list-group");
                    var newsArea = $("#newsArea").append($articleList);
                    var headline = article.title;
                    var $articleListItem = $("<li class='list-group-item articleHeadline'>");

                    if (headline) {
                        $articleListItem.append(
                            "<strong> " +
                            headline +
                            "</strong>" +
                            "<br>" +
                            "<br>" 
                        );
                    }


                    var url = article.url;
                    var pFour = $("<p>").text("url:" + url);

                    $articleList.append($articleListItem);

                    $articleListItem.append("<a href='" + article.url + "'>" + article.url + "</a>");
                }

            })
            newsTopics.push(topic);
            localStorage.setItem('newsTopics', JSON.stringify(newsTopics));
            renderButtons()

        })

    });


})
