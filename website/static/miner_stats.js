var workerHashrateData;
var workerHashrateChart;
var workerHistoryMax = 160;

var statData;
var totalHash;
var totalImmature;
var totalBal;
var totalPaid;
var totalShares;
var alerted = false;
var shareGage;
var invalidGage;
var workerGage;
var hashGage;

function getWorkerNameFromAddress(w) {
	var worker = w;
	if (w.split(".").length > 1) {
		worker = w.split(".")[1];
		if (worker == null || worker.length < 1) {
			worker = "noname";
		}
	} else {
		worker = "noname";
	}
	return worker;
}

function displayCharts() {
	var stats = getWorkerStats(_miner);
	shareGage = new JustGage({
	  id: "gauge",
	  value: stats.currRoundShares > 0 ? Math.floor((stats.currRoundShares / stats.currRoundPoolShares) * 100) : 0,
	  min: 0,
	  max: 100,
	  symbol: '%',
	  pointer: true,
	  pointerOptions: {
	    toplength: -15,
	    bottomlength: 10,
	    bottomwidth: 12,
	    color: '#8e8e93',
	    stroke: '#ffffff',
	    stroke_width: 3,
	    stroke_linecap: 'round'
	  },
	  title: "Shares This Round",
	  gaugeWidthScale: 0.6,
	  levelColors:["#e8e84c", "#6cdb5e"]
	});
	invalidGage = new JustGage({
	  id: "validShare",
	  value: Math.min(stats.invalidShares, 100),
	  min: 0,
	  max: 100,
	  symbol: '%',
	  pointer: true,
	  pointerOptions: {
	    toplength: -15,
	    bottomlength: 10,
	    bottomwidth: 12,
	    color: '#8e8e93',
	    stroke: '#ffffff',
	    stroke_width: 3,
	    stroke_linecap: 'round'
	  },
	  title: "Recent Invalid Shares",
	  gaugeWidthScale: 0.6,
	  levelColors:["#e8e84c", "#f73d3d"]
	});
	workerGage= new JustGage({
	  id: "workerDominance",
	  value: stats.miners ? (Object.keys(stats.miners).length / stats.poolSize) * 100 : 0,
	  min: 0,
	  max: 100,
		symbol: '%',
	  pointer: true,
	  pointerOptions: {
	    toplength: -15,
	    bottomlength: 10,
	    bottomwidth: 12,
	    color: '#8e8e93',
	    stroke: '#ffffff',
	    stroke_width: 3,
	    stroke_linecap: 'round'
	  },
	  title: "Worker Dominance",
	  gaugeWidthScale: 0.6,
	  levelColors:["#e8e84c", "#6cdb5e"]
	});
	var high = 0;
	console.log(stats.hashrate);
	hashGage = new JustGage({
	  id: "hashDominance",
	  value: stats.hashrate > 0 ? (stats.hashrate / stats.poolHashrate) * 100 : 0,
	  min: 0,
	  max: 100,
	  symbol: '%',
	  title: "Hashrate Dominance",
	  levelColors:["#e8e84c", "#6cdb5e"],
	  pointer: true,
	  pointerOptions: {
	    toplength: -15,
	    bottomlength: 10,
	    bottomwidth: 12,
	    color: '#8e8e93',
	    stroke: '#ffffff',
	    stroke_width: 3,
	    stroke_linecap: 'round'
	  },
	  gaugeWidthScale: 0.6
	});
	var maxScale = 0;
	var label = 'H/s';
	for (var w in stats.miners) {
		var pair = getReadableHashRatePair(Math.max.apply(null, stats.miners[w].hashrate.map(x => x[1])));
		var i = pair[2];
		if (maxScale < i) {
			maxScale = i;
			label = pair[1];
		}
	}
	var dataset = [];
	for (var d in stats.miners) {
		var data = stats.miners[d];
		var color = getRandomPastelColor();
		var o = {
			label: data.key,
			fill: false,
			data: data.hashrate.map(x => {
				return {
					t: x[0],
					y: getScaledHashrate(x[1], i)
				}
			}),
			borderWidth: 2,
			backgroundColor: color,
			borderColor: color
		};
		dataset.push(o);
	}

	workerHashrateChart = createDefaultLineChart(
		document.getElementById("workerHashChart").getContext('2d'),
		dataset,
		'Time',
		label
	);
}

function updateStats() {
	var stats = getWorkerStats(_miner);
	totalHash = stats.hashrate;
	totalPaid = stats.paid;
	totalBal = stats.balance;
	totalImmature = stats.immature;
	totalShares = stats.totalShares;
	// update miner stats
	$("#statsHashrate").text(getReadableHashRateString(totalHash));
	$("#statsHashrateAvg").text(getReadableHashRateString(calculateAverageHashrate(null)));
	$("#statsTotalImmature").text(totalImmature);
	$("#statsTotalBal").text(totalBal);
	$("#statsTotalPaid").text(totalPaid);
}

function updateWorkerStats() {
	var stats = getWorkerStats(_miner);
	// update worker stats
	var i = 0;
	for (var w in stats.miners) {
		i++;
		var htmlSafeWorkerName = w.split('.').join('_').replace(/[^\w\s]/gi, '');
		var saneWorkerName = getWorkerNameFromAddress(w);
		console.log(stats.miners[w]);
		$("#statsHashrate" + htmlSafeWorkerName).text(getReadableHashRateString(stats.miners[w].hashrate[stats.miners[w].hashrate.length - 1] || 0));
		$("#statsHashrateAvg" + htmlSafeWorkerName).text(getReadableHashRateString(calculateAverageHashrate(saneWorkerName)));
	}
}

function addWorkerToDisplay(name, htmlSafeName, workerObj) {
	var htmlToAdd = "";
	htmlToAdd = '<div class="boxStats" id="boxStatsLeft" style="float:left; margin: 9px; min-width: 260px;"><div class="boxStatsList">';
	htmlToAdd += '<div class="boxLowerHeader">' + name.replace(/[^\w\s]/gi, '') + '</div><div>';
	htmlToAdd += '<div><i class="fa fa-tachometer"></i> <span id="statsHashrate' + htmlSafeName + '">' + getReadableHashRateString(workerObj.hashrate[workerObj.hashrate.length - 1][1] || 0) + '</span> (Now)</div>';
	htmlToAdd += '<div><i class="fa fa-tachometer"></i> <span id="statsHashrateAvg' + htmlSafeName + '">' + getReadableHashRateString(calculateAverageHashrate(name)) + '</span> (Avg)</div>';
	htmlToAdd += '</div></div></div>';
	$("#boxesWorkers").html($("#boxesWorkers").html() + htmlToAdd);
}

function calculateAverageHashrate(worker) {
	var stats = getWorkerStats(_miner);
	var count = 0;
	var total = 1;
	var avg = 0;
	for (w in stats.miners) {
		count = 0;
		for (var ii = 0; ii < stats.miners[w].hashrate.length; ii++) {
			if (worker == null || stats.miners[w].key === worker) {
				count++;
				avg += parseFloat(stats.miners[w].hashrate[ii][1]);
			}
		}
		if (count > total)
			total = count;
	}
	avg = avg / total;
	return avg;
}


function rebuildWorkerDisplay() {
	var stats = getWorkerStats(_miner);
	$("#boxesWorkers").html("");
	var i = 0;
	for (var w in stats.miners) {
		i++;
		var htmlSafeWorkerName = w.split('.').join('_').replace(/[^\w\s]/gi, '');
		var saneWorkerName = getWorkerNameFromAddress(w);
		addWorkerToDisplay(saneWorkerName, htmlSafeWorkerName, stats.miners[w]);
	}
}


// grab initial stats
$.getJSON('/api/worker_stats?' + _miner, function(data) {
	if (document.hidden) return;
	$.getJSON('/api/pool_stats', function(statData) {
		addWorkerToTracker(statData, data, _miner, function(){
			var stats = getWorkerStats(_miner);
			statData = data;
			for (var w in statData.workers) {
				_workerCount++;
			}
			displayCharts();
			rebuildWorkerDisplay();
			updateStats();

			$('#total-paid-label').append(stats.paid.toFixed(8) + ' ' + stats.symbol);
		});
	});
});


// live stat updates
statsSource.addEventListener('message', function(e) {
	var stats = JSON.parse(e.data);
	$.getJSON('/api/worker_stats?' + _miner, function(data) {
    //$('#total-paid-label').empty();
    //$('#total-paid-label').append(total.toFixed(8) + ' ' + symbol);
	});
});
