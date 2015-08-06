var socket;
var cardHeight = 98;
var cardWidth = 73;
$(document).ready(function() {
	socket = io.connect();
	curPlayer = 0;
	var isNewGame = true;
	var stage;
	var cardLayer = new Kinetic.Layer();
	var cardsDrawn = new Array(8);
	var totalCards = [];
	var cardBackImage = new Image();
	cardBackImage.onload = tryDrawCards;
    cardBackImage.src = 'img/cardBack.png';

    var cardImages = new Image();
    cardImages.src = "img/cards.png";

    onceCb = false;
  	tryDrawCards();

	initChat(socket);

	$('#deal').on('click', function() {
		deal();
	});

	$('#hit').on('click', function() {
		hit();
	});

	$('#stand').on('click', function() {
		socket.emit('stand', curPlayer);
		stand(curPlayer);
	});

	socket.on('stand',function(p) {
		stand(p);
	});

	socket.on('initConnection', function(serverPlayer, totalCards) {
		for(var i = 0; i < 8; i++)
			$('#player'+i).removeClass('curPlayer');
		
		curPlayer = serverPlayer;
		$('#player'+curPlayer).addClass('curPlayer');
	});

	socket.on('drawCard', function(player, value, cardIndex, x, y) {
		drawCard(player, value, cardIndex, x, y);
	});

	socket.on('dealSync', function(player, value, cardIndex, x, y) {
		activateButtons();
		newGame();
		var card = randomCard();
		var pos = calcCardPos(card.value, card.type, card.offset);
		//setCard('#dealer1', 0, card.value,  pos.x, pos.y);
		drawCard(player, value, 0, x, y);
		stand(player);
	});

	function tryDrawCards() {
		if (!onceCb) {
        	onceCb = true;
        	return;
    	}
    	initCanvas();
	}

	function initCanvas() {
		stage = new Kinetic.Stage({
        	container: 'canvas',
        	height: cardHeight * 22,
        	width: cardWidth * 8
    	});
    	stage.add(cardLayer);
    	newGame();
	}

	function drawBackCards() {
		for(var i = 0; i < 8; i++) {
			for(var q = 0; q < 2; q++) {
				drawBackCard(i,q);
			}
		} 
	}

	function hit() {
		for(var i = 0; i < 2; i ++) {
			var card = randomCard();
			var pos = calcCardPos(card.value, card.type, card.offset);
			var element = $("#row"+i+" > th:nth-child(" + (curPlayer + 1) + ")").children();
			var cardIndex = cardsDrawn[curPlayer];
			socket.emit('drawCard', curPlayer, card.value, cardIndex, pos.x, pos.y);
			drawCard(curPlayer, card.value, cardIndex, pos.x, pos.y);
			if(cardsDrawn[curPlayer]>1){
				break;
			}
		}
	}

	function stand(p) {
		curPlayer = p;
		for(var i = 0; i < 8; i++){
			$('#player'+i).removeClass('curPlayer');
		}
		curPlayer++;
	
		if(curPlayer > 7) {
			endGame();
		}
		
		$('#player'+curPlayer).addClass('curPlayer');
	}

	function deal() {
		activateButtons();
		newGame();
		var card = randomCard();
		var pos = calcCardPos(card.value, card.type, card.offset);
		//setCard('#dealer1', 0, card.value,  pos.x, pos.y);
		drawCard(curPlayer, card.value, 0, pos.x, pos.y);
		socket.emit('dealSync', curPlayer, card.value, 0, pos.x, pos.y);
		socket.emit('emptycards');
		stand(curPlayer);
	}

	function randomCard() {
		var i = Math.floor(Math.random() * cards.length);
		return cards[i];
	}

	function drawCard(player, value, cardIndex, x, y) {
		var cardImg = new Kinetic.Image({
            x: (player * cardWidth),
            y: (cardIndex * cardHeight),
            image: cardImages,
            width: cardWidth,
            height: cardHeight,
            crop: {x: x, y: y, width: cardWidth, height: cardHeight}
        });
        cardLayer.add(cardImg);
        cardLayer.draw();
        cardsDrawn[player]++;

		checkValue(player, cardIndex, value);
	}

	function drawBackCard(player, cardIndex) {
		var cardBack = new Kinetic.Image({
            x: player * cardWidth,
            y: cardIndex * cardHeight,
            image: cardBackImage,
            width: cardWidth,
            height: cardHeight
        });

        cardLayer.add(cardBack);
        cardLayer.draw();
	}

	function calcCardPos(val, type, offset) {
		var pos = {'x':0, 'y': 0};
		if(type == 'Club') {
            pos.x = offset * cardWidth;
            pos.y = 0;
        } else if(type == 'Spade') {
            pos.x = offset * cardWidth;
            pos.y = 1 * cardHeight;
        } else if(type == 'Heart') {
            pos.x = offset * cardWidth;
            pos.y = 2 * cardHeight;
        } else if(type == 'Diamond') {
            pos.x = offset * cardWidth;
            pos.y = 3 * cardHeight;
        }
        return pos;
    }

    function checkValue(player, index, val) {
    	var curValue = parseInt($('#player'+player).text());
    	var totalVal = val + curValue;
    	$('#player'+player).text(totalVal +'');

    	if(totalVal > 21) {
    		$('#player'+player).removeClass('green').addClass('red');
    		stand(curPlayer);
    	}

    	if(player == 0 && cardsDrawn[0] > 1 && totalVal < 16) {
    		var card = randomCard();
			var pos = calcCardPos(card.value, card.type, card.offset);
    		drawCard(0, card.value, cardsDrawn[0], pos.x, pos.y);
    	}
    }

    function endGame() {
    	var card = randomCard();
		var pos = calcCardPos(card.value, card.type, card.offset);
    	curPlayer = 0;
    	drawCard(0, card.value, 1, pos.x, pos.y);
    	deactivateButtons();
    }

    function activateButtons() {
    	$('#hit').prop("disabled", false);   
    	$('#stand').prop("disabled", false); 
    }

    function deactivateButtons() {
    	$('#hit').prop("disabled", true);
    	$('#stand').prop("disabled", true);
    }

    function newGame() {
    	curPlayer = 0;
    	for(var i = 0; i < cardsDrawn.length; i++){
    		cardsDrawn[i] = 0;
    		var element = $("#player"+i).removeClass('red').removeClass('curPlayer').addClass('green');
    		$(element).text(0 +'');
    	} 
    	cardLayer.removeChildren();
    	drawBackCards();
    }
});