import React from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  // State of the calculator
  const [answerValue, setAnswerValue] = useState(0);
  const [readyToReplace, setReadyToReplace] = useState(true);
  const [memoryValue, setMemoryValue] = useState(0);
  const [operatorValue, setOperatorValue] = useState(0);
  const [expression, setExpression] = useState('');

  // To check the present of operators
  const operators = ['+', '-', '/', '*'];
  let containsOperator = operators.some((operator) =>
    expression.includes(operator)
  );
 
  //  Handling every case of when a button is pressed, it will be based on the type of the button
  function buttonPressed(type, value) {
    switch (type) {
      case 'number':
        if (readyToReplace && value !== 0) {
          setReadyToReplace(false);
          handleNumber(value);
        } else {
          handleNumber(value);
        }
        break;
      case 'operator':
        if (operatorValue === 0) {
            setMemoryValue(answerValue);
            setReadyToReplace(true);
            setOperatorValue(value);
            setExpression((prev) => prev + value);
        } 
        // Regular expression to check for current operators so that operators stacking does not happen(eg,1+-2). it will instead change the current operator with new input
        else if (/[+\-*/]$/.test(expression.slice(-1))) {
            setOperatorValue(value);
            setExpression((prev) => prev.slice(0, -1) + value);
        } 
        else {
            temp = calculateEquals(operatorValue);
            setReadyToReplace(true);
            setMemoryValue(temp);
            setOperatorValue(value);
            setExpression((prev) => prev + value);
          }
        break;
      
      //Separated clear into 2, all and last entry
      case 'clearAll':
        setReadyToReplace(true);
        setAnswerValue(0);
        setOperatorValue(0);
        setMemoryValue(0);
        setExpression('');
        break;
      case 'clearLast':
        if (!containsOperator || operators.includes(expression.slice(-1))) {
          setExpression('');
        } 
        else {
          console.log(answerValue)
          // To find the exact number of character to remove 
          setExpression((expression) => expression.slice(0, expression.length - answerValue.toLocaleString().length));
        }
        setReadyToReplace(true);
        setAnswerValue(0);
        break;
      case 'equal':
        if (operatorValue !== 0) {
          result = calculateEquals(operatorValue);
          setAnswerValue(result);
          setMemoryValue(result);
          setOperatorValue(0);
          setExpression(`${result}`);
          if(result==0){
            setReadyToReplace(true)
            setExpression('')
          }
        }
        break;
      case 'posneg':
        setAnswerValue((prevAnswerValue) => {
          const newValue = prevAnswerValue * -1;
          setExpression((prevExpression) => {
            // Match the last number in the expression (positive or negative, including decimals)
            const lastNumberMatch = prevExpression.match(/-?\d+(\.\d+)?$/);
            if (lastNumberMatch) {
              const lastNumber = lastNumberMatch[0];
               // Replace the last number in the expression with the new value
              const updatedExpression = prevExpression.replace(
                /-?\d+(\.\d+)?$/,
                `${newValue}`
              );
              return updatedExpression;
            }
            return prevExpression;
          });
          return newValue;
        });
        break;

      case '%':
        setAnswerValue((prevAnswerValue) => {
          const newValue = prevAnswerValue * 0.01;
          // Round the new value to avoid precision issues, rounding to 12 decimal places
          const rounded = Math.round(newValue * 1000000000000) / 1000000000000;
          setExpression((prevExpression) => {
            // Match the last number in the expression, including negative numbers
            const lastNumberMatch = prevExpression.match(/-?\d+(\.\d+)?$/);
            if (lastNumberMatch) {
              const lastNumber = lastNumberMatch[0];
              // If a match is found, replace the last number with the new rounded value
              const updatedExpression = prevExpression.replace(
                /-?\d+(\.\d+)?$/,
                `${rounded}`
              );
              return updatedExpression;
            }
            return prevExpression;
          });
          return rounded;
        });
        break;
    }
  }

  // To handle the equal button action
  function calculateEquals(operatorValue) {
    previous = parseFloat(memoryValue);
    current = parseFloat(answerValue);
    //Handling cases base on the operator value
    switch (operatorValue) {
      case '+':
        result = previous + current;
        break;
      case '*':
        result = previous * current;
        break;
      case '/':
        result = previous / current;
        break;
      case '-':
        result = previous - current;
        break;
    }
    // To avoid precision issues 
    return Math.round(result * 1000000000000) / 1000000000000;
  }

  // Handling the input of numbers
  function handleNumber(value) {
    current = answerValue.toString();
    // To handle so that there will be no consecutive '.'
    if (current.includes('.') && value === '.') {
      return;
    } 
    // To handle the decimal if it starts from 0
    else if (current === '0' && value === '.') {
      setAnswerValue(`${0}${value}`);
      setExpression((prev) => prev + '0.');
    } 
    else if (readyToReplace) {
      setAnswerValue(`${value}`);
      // Making sure that we cant input 0000... to the expression
      if(expression === '' && value === 0){
        return
      }
      else{
        setExpression((prev) => prev + value);
      }
    } 
    else {
      setAnswerValue(`${answerValue}${value}`);
      setExpression((prev) => prev + value);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.expressionText}>{expression}</Text>
        <Text style={styles.displayText}>{answerValue}</Text>
      </View>
      
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.buttonRow1,styles.buttonGold]}
          onPress={() => {
            if (answerValue === 0 || expression === '') {
              buttonPressed('clearAll');
            } else {
              buttonPressed('clearLast');
            }
          }}>
          <Text style={styles.buttonText}>
            {answerValue === 0 || expression === '' ? 'AC' : 'C'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonRow1,styles.buttonGold]}
          onPress={() => buttonPressed('posneg')}>
          <Text style={styles.buttonText}>+/-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonRow1,styles.buttonGold]}
          onPress={() => buttonPressed('%')}>
          <Text style={styles.buttonText}>%</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonRow1, styles.buttonOlive]}
          onPress={() => buttonPressed('operator', '/')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>÷</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 7)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 8)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 9)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>9</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOlive]}
          onPress={() => buttonPressed('operator', '*')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>x</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 4)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 5)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 6)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>6</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOlive]}
          onPress={() => buttonPressed('operator', '-')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>-</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 1)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 2)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', 3)}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOlive]}
          onPress={() => buttonPressed('operator', '+')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.buttonZero]}
          onPress={() => buttonPressed('number', 0)}>
          <Text style={[styles.buttonText, styles.buttonTextZero]}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => buttonPressed('number', '.')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOlive]}
          onPress={() => buttonPressed('equal')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>=</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  expressionText: {
    fontSize: 24,
    color: 'gray',
  },
  displayText: {
    fontSize: 42,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ED7014',
    marginHorizontal: 4,
    height: 80,
    borderRadius: 20,
  },
  buttonRow1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A9A9A9',
    marginHorizontal: 4,
    height: 80,
    borderRadius: 20,
  },
  buttonOlive: {
    backgroundColor: '#BAB86C',
  },
  buttonGold:{
    backgroundColor:'#f2e6be'
  },
  buttonText: {
    fontSize: 32,
    color: '#000',
  },
  buttonTextWhite: {
    color: '#fff',
  },
  buttonZero: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'left',
  },
  buttonTextZero: {
    textAlign: 'left',
    color: '#fff',
    paddingLeft: 40,
  },
});
