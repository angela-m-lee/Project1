//GreenMinder!
var indexs = [];
function localStoragePull(){

    $('tbody').empty();

    // Pull the button information and NYT Articles from localStorage with the function calls
    indexs = JSON.parse(localStorage.getItem('indexData')) || [];
    for (var x = 0; x < indexs.length; x++){
        var row = $('<tr>');
        var tbody = $('tbody');
        var date = $('<td>').append(indexs[x].date);
        var baseline = $('<td>').append(indexs[x].baseline);
        var percent = $('<td>').append(indexs[x].percent);
        var deleteButton = $('<td>').append($('<button>', {
            html: '<i class="trash icon"></i>',
            class: 'ui icon button negative',
            attr: 'data-index', x,
            click: function myDeleteFunction(){
                currentIndex = $(this).attr('data-index');
                indexs.splice(currentIndex, 1);
                localStorage.setItem('indexData', JSON.stringify(indexs));
                localStoragePull();
            }
        }));

        row.append(date);
        row.append(baseline);
        row.append(percent);
        row.append(deleteButton);
        tbody.append(row);
        console.log(indexs)
        console.log(x);
    }
}
    var searches = [];
    function renderButtons() {
    
           // Deleting the movies prior to adding new searches
           // (this is necessary otherwise you will have repeat buttons)
           $("#topicButtons").empty();
    
           // Looping through the array of searches
           for (var i = 0; i < searches.length; i++) {
            var searchButtons = $('<button>',{
                class: 'ui button'
            })
            var searchTrashButton = $('<button>', {
                html: '<i class="trash icon"></i>',
                class: 'ui button',
                attr: 'data-index', i,
                click: function myTrashFunction(){
                    currentIndex = $(this).attr('data-index');
                    indexs.splice(currentIndex, 1);
                    localStorage.setItem('indexData', JSON.stringify(searches));
                    renderButtons();
                }
            });
             // Then dynamicaly generating buttons for each movie in the array
             searchButtons.append(searchTrashButton);
             $('#topicButtpns').append(searchButtons);
             // This code $("<button>") is all jQuery needs to create the beginning and end tag. (<button></button>)
           }
         }
$(document).ready(function(){
    // Creating the indexs array to store all the purchases
    var pastIndexPrices = [];
    //creates the function that pulls from local storage on page load.

    localStoragePull();


    //function that creates the new index
    $('#buyButton').on('click', function(event){
        // Prevents that event from happening before button is clicked.
        event.preventDefault();
        const apiKey = 'FKRKPA78COC2GQDQ';
        // Creating the URL for AlphaVantage
        var alphaURL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPX&interval=1min&apikey=' + apiKey;
       // var alphaURL = 'https://www.omdbapi.com/?t=jaws&y=&plot=short&apikey=trilogy';
        
        
        //Fix AJAX CALL AND URL!!!
        $.ajax({
            url: alphaURL,
            method: 'GET'
        }).then(function(response){
            // Setting currentValue to equal Index Price. 
            var lastRefresh = response['Meta Data']['3. Last Refreshed'];
            var currentValue = response['Time Series (1min)'][lastRefresh]['4. close']; 
            console.log(response);
            
            // calling the percentChange function and setting the return to percent.
            var percent = percentChange(currentValue, pastIndexPrices);
            
            // creating the object everytime it's clicked
            var index = {
                'date': lastRefresh,
                'baseline': currentValue,
                'percent': percent
            };
            // pushing the index OBJECT to the indexs ARRAY
            indexs.push(index);
            // Saving to LocalStorage
            localStorage.setItem('indexData', JSON.stringify(indexs));

            localStoragePull();

            // Get the Ajax call and then append the current value of the Index Price to the div so it shows the current price on Page.
            $('#currentPrice').text('').append(currentValue);
        })
    });

 // -----------------------------------------------------------------------------------------------------------
// Code for Wall Street Journal

// code for the SEARCH BOX on CLICK.
$('#submit').on('click', function(event) {
       event.preventDefault();
       console.log("I've been clicked!");
       // This line grabs the input from the textbox
       var topic = $('#topicInput').val().trim();
       $.ajax({
        url: 'https://newsapi.org/v2/top-headlines?q=' + topic + '&apiKey=2820b40a103f4ac58cda4ba7df6cf3d9',
        method: 'GET'
       }).then(function(response){
           console.log(response);
           for (var j = 0; j < response.length; j++){
               console.log(response.articles[j].title);
           }
       })

       // Adding movie from the textbox to our array
       searches.push(topic);
       localStorage.setItem('searchData', JSON.stringify(searches));
       renderButtons();
       // Calling renderButtons which handles the processing of our movie array
    
     });


})


//This is just a copy space for function.

// Creates a function that takes in current Index Price and Past Array.
function percentChange (current, array){
    var percent = '';
    var change;
    if (array.length === 0){
      array.push(current);
      percent = '0%';
      console.log(array)
      console.log(percent);
      return percent;
    } else {
      for (var i = 0; i < array.length; i++){
        change = 1 - (current / array[i]);
        percent = (change * 100).toFixed(3) + ' %';
        return percent; 
      }
    }
  };


