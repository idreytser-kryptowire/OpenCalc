pipeline {
    agent any // Or specify a specific agent/label

    environment {
        // Define your build variant (e.g., debug, release)
        BUILD_TYPE = 'debug' 
        ANDROID_HOME = '/home/ilya/Android/Sdk'
        JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
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
                sh "/usr/lib/jvm/java-21-openjdk-amd64/bin/javac --version"
                sh "echo $JAVA_HOME"
                sh "sdkmanager --licenses"
                sh "./gradlew --debug --scan assemble${BUILD_TYPE.capitalize()}"
            }
        }

        stage('Test') {
            steps {
                // Run unit tests (if you have them)
                sh './gradlew test'
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
