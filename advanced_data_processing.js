/* 
   File Name: advanced_data_processing.js
   
   Description:
   This code implements a sophisticated data processing algorithm. It reads data from a CSV file, performs various data preprocessing steps including cleaning, normalization, and feature engineering, and then trains a machine learning model to make predictions on new data. The code is written in a modular and efficient manner, making use of modern JavaScript features and libraries such as async/await, Promises, and arrow functions.
*/

// Import required libraries
const fs = require('fs');
const csv = require('csv-parser');
const { DataFrame } = require('dataframe-js');
const { mean, standardDeviation, min, max } = require('simple-statistics');
const { RandomForestRegression } = require('random-forest-regression');

// Constants
const DATA_FILE = 'data.csv';
const TRAIN_TEST_SPLIT = 0.8;
const TARGET_COLUMN = 'target';
const NUMERICAL_COLUMNS = ['feature1', 'feature2', 'feature3'];
const CATEGORICAL_COLUMNS = ['category1', 'category2', 'category3'];

// Utility functions
const readFile = (filePath) =>
  new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => resolve(data))
      .on('error', (error) => reject(error));
  });

const preprocessData = async (data) => {
  // Convert data to DataFrame
  const df = new DataFrame(data);

  // Cleaning: Remove rows with missing values
  const cleanedDf = df.dropna();

  // Normalization: Scale numerical columns to range [0, 1]
  const normalize = (columnName) => {
    const column = cleanedDf.getColumn(columnName);
    const minValue = min(column);
    const maxValue = max(column);
    cleanedDf.setColumn(
      columnName,
      column.map((value) => (value - minValue) / (maxValue - minValue))
    );
  };
  NUMERICAL_COLUMNS.forEach(normalize);

  // Feature Engineering: Create new features
  cleanedDf.addColumn('feature4', (row) => row.get('feature1') * row.get('feature2'));
  cleanedDf.addColumn('feature5', (row) => row.get('feature3') - mean(cleanedDf.getColumn('feature3')));

  // One-Hot Encoding: Convert categorical columns to numerical
  const dummyEncode = (columnName) => {
    const column = cleanedDf.getColumn(columnName);
    const uniqueValues = column.unique().sort();
    uniqueValues.forEach((value) => {
      cleanedDf.addColumn(`${columnName}_${value}`, (row) => (row.get(columnName) === value ? 1 : 0));
    });
    cleanedDf.deleteColumn(columnName);
  };
  CATEGORICAL_COLUMNS.forEach(dummyEncode);

  return cleanedDf.toCollection();
};

const trainModel = async (data) => {
  // Split data into training and testing sets
  const trainSize = Math.floor(data.length * TRAIN_TEST_SPLIT);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  // Prepare input features and target variable
  const xTrain = trainData.map((row) => NUMERICAL_COLUMNS.map((column) => row[column]));
  const yTrain = trainData.map((row) => row[TARGET_COLUMN]);
  const xTest = testData.map((row) => NUMERICAL_COLUMNS.map((column) => row[column]));
  const yTest = testData.map((row) => row[TARGET_COLUMN]);

  // Train a random forest regression model
  const model = new RandomForestRegression({ nEstimators: 10, seed: 42 });
  await model.train(xTrain, yTrain);

  // Evaluate model on test set
  const predictions = await model.predict(xTest);
  const mse = predictions.reduce((sum, pred, index) => sum + (pred - yTest[index]) ** 2, 0) / predictions.length;
  const rmse = Math.sqrt(mse);
  console.log(`Root Mean Squared Error: ${rmse}`);
};

// Main function
const main = async () => {
  // Read data from CSV file
  const rawData = await readFile(DATA_FILE);

  // Preprocess and prepare data for training
  const preprocessedData = await preprocessData(rawData);

  // Train and evaluate the model
  await trainModel(preprocessedData);
};

// Execute main function
main().catch((error) => console.error(error));
