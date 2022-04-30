const modes = ["normal", "hard"] as const
type Mode = typeof modes[number]
const nextActions = ['play again', 'exit'] as const
type NextAction = typeof nextActions[number]

class GameProcedure{
    private currentGameTitle = "hit and blow"
    private currentGame = new HitAndBlow()

    public async start(){
        await this.play()
    }

    public async play(){
        printLine(`===\n${this.currentGameTitle} starts ! \n===`)
        await this.currentGame.setting()
        await this.currentGame.play()
        this.currentGame.end()
        
        const action = await promptSelect<NextAction>("do you continue to the game", nextActions)
        if(action === "play again"){
            await this.play()
        }else if (action === "exit"){
            this.end()
        }else{
            const neverValue: never = action
            throw new Error(`${neverValue} is an invalid action`)
        }
    }

    private end(){
        printLine("finish the game")
        process.exit()
    }


}

class HitAndBlow {
    private readonly answerSource = ["0","1","2","3","4","5","6","7","8","9"]
    private answer :string[] = []
    private tryCount = 0
    private mode: Mode = "normal"

    async play(){
        const answerLength = this.getAnswerLength()
        const inputArr = (await promptInput(`「,」区切りで${answerLength}つの数字を入力してください`)).split(",")
        const result =this.check(inputArr)

        if(!this.validate){
            printLine('it is not valid')
            await this.play()
            return
        }

        if(result.hit !== this.answer.length){
            printLine(`---\nHit: ${result.hit}\nBlow: ${result.blow}\n---`)
            this.tryCount += 1
            await this.play()
        }else{
            this.tryCount += 1
        }
    }

    end(){
        printLine(`coreect!\ncount number: ${this.tryCount}`)
        this.reset()
    }
    private reset(){
        this.answer = []
        this.tryCount = 0
    }

    private check(input: string[]){
        let hitCount = 0
        let blowCount = 0

        input.forEach((val, index) => {
            if(val === this.answer[index]){
                hitCount += 1
            }else if (this.answer.includes(val)){
                blowCount +=1
            }
        })

        return {
            hit: hitCount,
            blow: blowCount,
        }
        
    }



    async setting(){
        this.mode = await promptSelect<Mode>("choice the mode",modes)
        const answerLength = this.getAnswerLength()
        
        
        while(this.answer.length < answerLength){
            const randNum = Math.floor(Math.random() * this.answerSource.length)
            const selectedItem = this.answerSource[randNum]
            if(!this.answer.includes(selectedItem)){
                this.answer.push(selectedItem)
            }
        }
    }

    private validate(inputArr: string[]){
        const isLengthValid = inputArr.length === this.answer.length
        const isAllAnswerSourceOption = inputArr.every((val) => this.answerSource.includes(val))
        const isAllDifferentValues = inputArr.every((val, i) => inputArr.indexOf(val) === i)
        return isLengthValid && isAllAnswerSourceOption && isAllDifferentValues
    }

    private getAnswerLength(){
        switch(this.mode){
            case 'normal':
                return 3
            case 'hard':
                return 4
            default:
                throw new Error(`${this.mode} is not valid mode`)
        }
    }
}

const readLine =async () => {
    const input: string = await new Promise((reslove) =>
    process.stdin.once('data', (data)=> reslove(data.toString())))
    return input.trim()
    
}

const printLine = (text: string, breakLine: boolean = true) =>{
    process.stdout.write(text + (breakLine? '\n' : ''))
}

const promptSelect = async <T extends string>(text: string, values: readonly T[]): Promise<T> => {
    printLine(`\n${text}`)
    values.forEach((value) => {
        printLine(`- ${value}`)
    })
    printLine(`>`, false)

    const input = (await readLine()) as T
    if(values.includes(input)){
        return input
    }else{
        return promptSelect(text, values)
    }
}

const promptInput = async(text:string) => {
    printLine(`\n${text}\n>`, false)
    return readLine()
}

(async () => {
    new GameProcedure().start()
})()
