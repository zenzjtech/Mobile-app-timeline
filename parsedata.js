function toTimestamp(date) {
	//Sample input format: "2016-01-01" (ISO date format)
	if (date.includes('-')) {
		date=date.split("-");
		date=date[1]+"/"+date[2]+"/"+date[0];
	}
	return (new Date(date).getTime());
}


function compareElement(a,b) {
	return (a.x > b.x);
}


function csvToFlagData(data, startDate) {
	//data: array of data to be used for flags
	// startDate: string (MM-DD-YYYY)
	startDate = new Date(startDate).getTime();
	newArr = [];

	// // console.log(data);
	previous_text_ = "";
	for (i = 0; i < data.length; i++) 
		if (data[i]["Update Type"] === "Version"){		
		
		dateUTC = toTimestamp(data[i]["Date"]);
		text_ = data[i]["Notes"];
		if (text_ === previous_text_)
			continue;
		previous_text_ = text_;
		text_ = "Version " + data[i]["New Value"] + ": " + text_;
		// // console.log(data[i]);
		//title_ = data[i]["App Name"].split(" ")[0];

		if (dateUTC >= startDate) {
			new_element = {
				x: dateUTC,
				// Only take the first word to shorten for better displaying
				title: ' ',
				text: text_,
			},
			// // console.log(new_element.text);
			newArr.push(new_element);
		}
	}
	newArr.sort(compareElement)
	return newArr;
}

$(function () {
	$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
	});
	// var data = $.get("messages.csv");
	// // console.log(JSON.stringify(data),data);
	// SHOULD BE PUT IN AN INDEX FILE BUT I AM LAZY, SORRY THE NEXT PROGRAMMER WHO HAS TO READ THESE LINE OF CODE!
	dir = "data/iOS/"
	rankFile = "ranking.csv";
	messageFile = 'message.csv';
	// versionLogFile = "database.csv";
	startDate = "01/01/2016"
	versionLogDir = dir + "version-logs/";
	iconDir = "data/icon/32px/"
	versionLogFile = ["App_Annie_Store_Stats_TimeLine_iOS_Messenger.csv",
					"App_Annie_Store_Stats_TimeLine_iOS_BIGO LIVE - Live Broadcasting.csv",
					"App_Annie_Store_Stats_TimeLine_iOS_Viber.csv",
					"App_Annie_Store_Stats_TimeLine_iOS_WeChat.csv",
					"App_Annie_Store_Stats_TimeLine_iOS_Zalo.csv"];

	var series = [];

	// select columns corresponding to app name within the table
	function creatSeriesElement(key) {
		//// console.log(kvArray);
		var newArr = rankData.map(function(obj){ 
			// // console.log(key, obj, obj[key]);
	   		return [toTimestamp(obj.Date), parseInt(obj[key])];
		});
		return newArr;
	}

    Highcharts.setOptions({
        global: {
            timezoneOffset: -7 * 60
        }
    });

	function createChart() {
		Highcharts.stockChart('container', {

			colors: ['#018FE5', '#04C2FE', '#4AB40C', '#7B519C', 'orange'],
		    
		    rangeSelector: {
		        selected: 1
		    },
			
			legend: {
				enabled: true,
				layout: 'horizontal',
				maxHeight: 100,
				borderWidth: 4,
				borderColor: '#e3e4e0',
				backgroundColor: '#eeffc5',
				padding: 15,
				itemDistance: 40,
				itemStyle: {
            		color: '#000000',
            		fontSize: '15px'
        		}
			},

	        tooltip: {
	        	headerFormat:  '<span style="font-size: 12px">{point.key}</span><br/>',
                style: {
                		width: '200px',
                		fontSize: '11pt'
            	},
            	borderColor: '#e3e4e0',
            	backgroundColor: '#eeffc5'
		    },
		    title: {
		        text: 'Timeline apps rank, verion logs and Zalo messages',
		        style: {
                	color: '#234CA4',
                	fontSize: '20pt',
                	// 'padding-top': '50px',
                	fontWeight: 'bold',
            	}
		    },
			// tooltip: {
			// 	split: true,
			// },

			// xAxis:
			// {
   //          crosshair: {
   //              enabled: false
   //          }
   //      	},
		    yAxis: [{
		    		reversed: true,	
		        	title: {
			            text: 'Daily app rank',
			            style: {
                			color: '#234CA4',
                			fontSize: '15pt',
                			// 'padding-top': '50px',
                			fontWeight: 'bold',
            			}
			        },
			        height: '50%',			        
			        lineWidth: 2,
			        offset: 50,
			        min: 0,
			    },
		        {
			        title: {
			        	text: 'Daily total messages',
			        	style: {
                			color: '#234CA4',
                			fontSize: '15pt',
                			// 'padding-top': '50px',
                			fontWeight: 'bold',
            			}
			        },
					top: '50%',	
			        lineWidth: 2,
					height: '50%',
			        offset: 50,
		    	}
		    ],
		    // xAxis: {
      //       labels: {
      //           style: {
      //               color: 'red',
      //               fontSize:'15px'
      //           }
      //       }
      //   	},
		    series: series
		}); 
	}


	// Get and process input data
	$.get(dir + rankFile, function(rank) {
		$.get(dir + messageFile, function(message){
		// // console.log(data);

		// Parsing app ranking 
		// // console.log(dir + rankFile)
		rankData = Papa.parse(rank, {
			header: true,
			newline: "\n",
			skipEmptyLines: true
		});
		// // console.log(rankData)
		rankData = rankData.data;
		rank_header = Object.keys(rankData[0]);

		for (i = 1; i<rank_header.length; i++) {
			series[i-1] = {
				name: rank_header[i],
				data: creatSeriesElement(rank_header[i]),
				yAxis: 0,
				type: 'spline',
			}
		}

		console.log(creatSeriesElement(rank_header[1]));
		//Parsing Zalo daily messages
		messData = Papa.parse(message, {
			header: true,
			newline: "\n",
			skipEmptyLines: true
		});
		// // console.log(rankData)
		messData = messData.data;
		
		mess_header = Object.keys(messData[0]);		

		messData = messData.map(function(obj){ 
			// // console.log(key, obj, obj[key]);
	   		return [toTimestamp(obj[mess_header[0]]), parseInt(obj[mess_header[1]])];
		});

		series.push({
			type: 'line',
			id: "Zalo Daily message",
			name: mess_header[1],
			data: messData,
			// type: 'line',
			yAxis: 1
		});
		
		// this variable is to check if data is finished reading.
		counter = 0;

		versionLogFile.forEach(function(file) {
			$.get(versionLogDir + file, function(versionLog) {
				
				//// console.log(versionLog);
				// console.log(versionLogDir + file);
				// Read and parse data
				versionLogData = Papa.parse(versionLog, {
					header: true,
					newline: "\n",
					skipEmptyLines: true
				});	
				
				// console.log(versionLogData);
				// only take the first words of the app name
				appName = versionLogData.data[0]["App Name"].split(" ")[0];
				// console.log(appName);
				versionLogData =  csvToFlagData(versionLogData.data, startDate);
				// Added to chart
				series.push({
					// className: "Version logs",
			        type: 'flags',
			        name: "Logs " + appName,
			        data: versionLogData,
			        // shape: "icon/zalo.png",
			        // onSeries: 'daily message',
			        // shape: 'url(https://lh3.googleusercontent.com/9pF2tyIQSZ1vdWXM7IL71L6dAy5UWJfFrtM20c6tzLQ2nZyVWHk9LFHWvAotsyeS2UE=w300)',
			        shape: 'url(' + iconDir + appName +  '.png)',
			        // useHTML: true,
			        color : 'orange',
			        allowPointSelect: true,
	    		});

	    		counter += 1;
	    		if (counter === versionLogFile.length) {
					createChart();
	    		}
			});
		});
		});
	    // Drawing charts()
		
	});
});
