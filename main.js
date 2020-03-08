// 放在文件最上方
const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
}

// Symbols = ['黑桃', '愛心', '方塊', '梅花']
const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg',
    'https://image.flaticon.com/icons/svg/105/105220.svg',
    'https://image.flaticon.com/icons/svg/105/105212.svg',
    'https://image.flaticon.com/icons/svg/105/105219.svg'
  ]


const view = {
    displayCards(cards) {
        document.querySelector('#cards').innerHTML = cards.map(index => this.getCardElement(index)).join('')
    },

    getCardElement (index) {
        return `
        <div data-index = '${index}' class = "card back" > 
        </div>`
    },

    getCardContent (index) {
        const symbol = Symbols[Math.floor(index / 13)]
        return `
            <p>${this.transformNumber(index)}</p>
            <img src="${symbol}" />
            <p>${this.transformNumber(index)}</p></div>
        `
    },

    transformNumber (index) {
        const number = (index % 13) + 1
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number   
        }
    },

    flipCard(card) {
        // card 背面 => return 正面
        // card 正面 => return 背面
        if (card.classList.contains('back')){
            card.classList.remove('back')
            card.innerHTML = this.getCardContent(card.dataset.index)
            return
        }
        card.classList.add('back')
        card.innerHTML = null
    },
    renderScore(score){
      document.querySelector('.score').innerHTML = `Score: ${score}`;
    },
    renderTriedTimes(times){
      document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
    },

    pairCard(card) {
      card.classList.add("paired")
    },
    appendWrongAnimation(...cards) {
      cards.map(card => {
        card.classList.add('wrong')
        card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
        })
    },
    showGameFinished() {
      const completeText = document.createElement('p')
      const header = document.querySelector('#header')
      const cards = document.querySelector('#cards')
      
      completeText.classList.add('complete')
      completeText.innerText = 'Complete!'
      
      header.insertBefore(completeText, document.querySelector('#header .score'))
      header.classList.add('completed')
      cards.classList.add('completed')
    },       
}

const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards () {
      view.displayCards(utility.getRandomNumberArray(52))
    },
    revealCard (card) {
      model.revealedCards.push(card)
      console.log('當下翻開的牌組', model.revealedCards.map(card => card.dataset.index))
      view.flipCard(card)
    },
    dispatchCardAction (card) {
      if (!card.classList.contains('back')) {
        return
      }
      switch (this.currentState) {
        case GAME_STATE.FirstCardAwaits:
          this.revealCard(card)
          this.currentState = GAME_STATE.SecondCardAwaits
          return
        case GAME_STATE.SecondCardAwaits:
          this.revealCard(card)
          view.renderTriedTimes(++model.triedTimes)  
          // 之後開始做計分
          if (model.isRevealedCardsMatched()) {
            this.currentState = GAME_STATE.CardsMatched 
            this.score()
            return
          }
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards) // add this
          setTimeout(this.resetRevealedCards, 1000)      
      } 
    },
    // 將已經翻開來的卡片翻回去，而且把 model 裡面的 revealedCards 清掉
    resetRevealedCards () {
      view.flipCard(model.revealedCards[0])
      view.flipCard(model.revealedCards[1])
      model.clearRevealedCards()
      controller.currentState = GAME_STATE.FirstCardAwaits
    },
    score () {
      view.renderScore((model.score += 10))
      view.pairCard(model.revealedCards[0])
      view.pairCard(model.revealedCards[1])
      model.clearRevealedCards()
      this.currentState = GAME_STATE.FirstCardAwaits
      if (model.score === 260) {
        this.currentState = GAME_STATE.GameFinished
        console.log('現在狀態', GAME_STATE[controller.currentState])
        view.showGameFinished()
      }  
    },
  }
  const model = {
    revealedCards: [],
    clearRevealedCards () {
      this.revealedCards = []
    },
    triedTimes: 0,
    score: 0,
    isRevealedCardsMatched() {
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
    }
  }

const utility = {
    getRandomNumberArray (count) {
      const number = Array.from(Array(count).keys())
      for (let index = number.length - 1; index > 0; index--) {
        let randomIndex = Math.floor(Math.random() * (index + 1))
          ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
      }
      return number
    }
}

controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      controller.dispatchCardAction(card)
      console.log('現在狀態', GAME_STATE[controller.currentState])
    })
  })