// 计算器插件
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export const config = {
  name: '计算器',
  version: '1.0.0',
  description: '简单的计算器插件',
};

const CalculatorPlugin = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);

  const handlePress = (value) => {
    if (display === '0' || display === '错误') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const calculate = () => {
    try {
      const result = eval(display);
      setHistory([...history, `${display} = ${result}`]);
      setDisplay(String(result));
    } catch (error) {
      setDisplay('错误');
    }
  };

  const clear = () => {
    setDisplay('0');
  };

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧮 {config.name}</Text>
      
      <View style={styles.display}>
        <Text style={styles.displayText}>{display}</Text>
      </View>

      <View style={styles.buttonGrid}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.button,
                  btn === '=' ? styles.equalsButton : {},
                  ['/', '*', '-', '+'].includes(btn) ? styles.operatorButton : {},
                ]}
                onPress={() => (btn === '=' ? calculate() : handlePress(btn))}
              >
                <Text style={styles.buttonText}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clear}>
        <Text style={styles.clearButtonText}>清除</Text>
      </TouchableOpacity>

      {history.length > 0 && (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>历史记录</Text>
          <ScrollView style={{ maxHeight: 100 }}>
            {history.map((item, index) => (
              <Text key={index} style={styles.historyItem}>
                {item}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  display: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  displayText: {
    color: '#2ecc71',
    fontSize: 24,
    textAlign: 'right',
  },
  buttonGrid: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#7f8c8d',
    padding: 15,
    marginHorizontal: 3,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  operatorButton: {
    backgroundColor: '#e67e22',
  },
  equalsButton: {
    backgroundColor: '#27ae60',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  history: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#7f8c8d',
  },
  historyTitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 5,
  },
  historyItem: {
    color: '#95a5a6',
    fontSize: 12,
  },
});

export default CalculatorPlugin;
