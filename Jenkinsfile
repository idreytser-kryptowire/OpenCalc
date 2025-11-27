pipeline {
    agent any // Or specify a specific agent/label

    environment {
        // Define your build variant (e.g., debug, release)
        BUILD_TYPE = 'debug' 
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout your Android project from SCM
                git branch: 'main', credentialsId: '', url: 'https://github.com/idreytser-kryptowire/OpenCalc.git'
            }
        }

        stage('Clean') {
            steps {
                // Clean the project
                sh './gradlew clean'
            }
        }

        stage('Build') {
            steps {
                // Build the Android app for the specified BUILD_TYPE
                sh "echo $ANDROID_HOME"
                sh "./gradlew assemble${BUILD_TYPE.capitalize()}"
            }
        }

        stage('Kryptowire') {
            steps {
                withCredentials([string(credentialsId: 'KryptowireAPIKey', variable: 'API_KEY')]) {
                    kwSubmit filePath: "app/build/outputs/apk/debug/app-debug.apk", platform: 'android', apiKey: $API_KEY
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                // Archive the generated APK
                archiveArtifacts artifacts: "app/build/outputs/apk/${BUILD_TYPE}/*.apk", fingerprint: true
            }
        }
    }

    post {
        always {
            // Optional: Clean up workspace after build
            deleteDir()
        }
        success {
            echo 'Android app build successful!'
        }
        failure {
            echo 'Android app build failed!'
        }
    }
}
