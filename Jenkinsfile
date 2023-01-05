pipeline {
    agent {
        label 'docker'
    }
    environment {
        DEMO_SERVER = '147.172.178.30'
        DEMO_SERVER_PORT = '3000'
        DEMO_USER = 'jenkinsci'
        API_FILE = 'api-json'
        API_URL = "http://${env.DEMO_SERVER}:${env.DEMO_SERVER_PORT}/${env.API_FILE}"
    }

    stages {

        stage('Prepare NodeJS') {
            agent {
                docker {
                    image 'node:18-bullseye'
                    args '-v $HOME/.npm:/.npm'
                    label 'docker'
                    reuseNode true
                }
            }
            stages {
                stage('Install Dependencies') {
                    steps {
                        sh 'npm install'
                    }
                }
                parallel {
                    stage('Build') {
                        steps {
                            sh 'npm run build'
                            sh 'rm -f Backend.tar.gz'
                            sh 'tar czf Backend.tar.gz dist src test config package.json package-lock.json ormconfig.ts tsconfig.json'
                        }
                    }
                    stage('Lint') {
                        steps {
                            sh 'npm run lint:ci'
                        }
                    }
                }

            }
        }
        stage('Test') {
            environment {
                POSTGRES_DB = 'SelfLearningDb'
                POSTGRES_USER = 'username'
                POSTGRES_PASSWORD = 'password'
                DATABASE_URL = "postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:5432/${env.POSTGRES_DB}"
            }
            steps {
                script {
                    // Sidecar Pattern: https://www.jenkins.io/doc/book/pipeline/docker/#running-sidecar-containers
                    docker.image('postgres:14.3-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB}") {
                        c ->
                            docker.image('postgres:14.3-alpine').inside("--link ${c.id}:db") {
                                //sh 'until pg_isready; do sleep 5; done' // currently not working
                                sh "sleep 20"
                            }
                        docker.image('node:18-bullseye').inside("--link ${c.id}:db") {
                            sh 'npm run prisma db push'
                            sh 'npm run test:ci'
                        }
                    }
                }
            }
        }
        stage('Test') {
            environment {
                POSTGRES_DB = 'StudentMgmtDb'
                POSTGRES_USER = 'postgres'
                POSTGRES_PASSWORD = 'admin'
            }
            steps {
                script {
                    docker.image('postgres:14.3-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB}") {
                        c ->
                            docker.image('postgres:14.1-alpine').inside("--link ${c.id}:db") {
                                //sh 'until pg_isready; do sleep 5; done' // currently not working
                                sh "sleep 20"
                            }
                        docker.image('node:18-bullseye').inside("--link ${c.id}:db") {
                            sh 'npm run test:jenkins'
                        }
                    }
                }
                step([
                    $class: 'CloverPublisher',
                    cloverReportDir: 'output/test/coverage/',
                    cloverReportFileName: 'clover.xml',
                    healthyTarget: [methodCoverage: 70, conditionalCoverage: 80, statementCoverage: 80], // optional, default is: method=70, conditional=80, statement=80
                    unhealthyTarget: [methodCoverage: 50, conditionalCoverage: 50, statementCoverage: 50], // optional, default is none
                    failingTarget: [methodCoverage: 0, conditionalCoverage: 0, statementCoverage: 0] // optional, default is none
                ])
            }
            post {
                always {
                    junit 'output/**/junit*.xml'
                }
            }
        }

        stage('Build Docker') {
            steps {
                // Use build Dockerfile instead of Test-DB Dockerfile to build image
                sh 'cp -f docker/Dockerfile Dockerfile'
                script {
                    // Based on:
                    // - https://e.printstacktrace.blog/jenkins-pipeline-environment-variables-the-definitive-guide/
                    // - https://stackoverflow.com/a/16817748
                    // - https://stackoverflow.com/a/51991389
                    env.API_VERSION = sh(returnStdout: true, script: 'grep -Po \'(?<=export const VERSION = ")[^";]+\' src/version.ts').trim()
                    echo "API: ${env.API_VERSION}"
                    dockerImage = docker.build 'e-learning-by-sse/qualityplus-student-management-service'
                    docker.withRegistry('https://ghcr.io', 'github-ssejenkins') {
                        dockerImage.push("${env.API_VERSION}")
                        dockerImage.push('latest')
                    }
                }
            }
        }

        parallel {
            stage('Deploy') {
                steps {
                    sshagent(['STM-SSH-DEMO']) {
                        sh "ssh -o StrictHostKeyChecking=no -l ${env.DEMO_USER} ${env.DEMO_SERVER} bash /staging/update-compose-project.sh qualityplus-student-management-system"
                    }
                }
            }

            stage('Publish Results') {
                steps {
                    archiveArtifacts artifacts: '*.tar.gz'

                    sleep(time: 40, unit: "SECONDS")
                    sh "wget ${env.API_URL}"
                    archiveArtifacts artifacts: "${env.API_FILE}"
                }
            }

            stage("Trigger Downstream Projects") {
                steps {
                    build job: 'Teaching_StuMgmtDocker', wait: false
                    build job: 'Teaching_StudentMgmt-Backend-API-Gen', wait: false
                }
            }

            stage('Trigger API Client') {
                // Execute this step only if Version number was changed
                // Based on: https://stackoverflow.com/a/57823724
                when {
                    changeset "src/version.ts"
                }
                steps {
                    build job: 'Teaching_StudentMgmt-API-Client', parameters: [string(name: 'API', value: 'STU-MGMT')], wait: false
                }
            }
        }
    }

    post {
        always {
            // Send e-mails if build becomes unstable/fails or returns stable
            // Based on: https://stackoverflow.com/a/39178479
            load "$JENKINS_HOME/.envvars/emails.groovy"
            step([$class: 'Mailer', recipients: "${env.elsharkawy}, ${env.klingebiel}", notifyEveryUnstableBuild: true, sendToIndividuals: false])

            // Report static analyses
            recordIssues enabledForFailure: false, tool: checkStyle(pattern: 'output/eslint/eslint.xml')
        }
    }
}
