import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Award, CheckCircle, Lock, Play, BookOpen, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SecurityTraining() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to get user:', err);
      }
    };
    getUser();
  }, []);

  const courses = [
    {
      id: 'sql-injection',
      title: 'SQL Injection Prevention',
      description: 'Learn how to identify and prevent SQL injection vulnerabilities',
      duration: '30 min',
      level: 'Beginner',
      topics: ['SQL Injection Basics', 'Parameterized Queries', 'ORM Security', 'Real-world Examples'],
      icon: '🛡️'
    },
    {
      id: 'xss-defense',
      title: 'Cross-Site Scripting (XSS) Defense',
      description: 'Master XSS attack vectors and prevention techniques',
      duration: '45 min',
      level: 'Intermediate',
      topics: ['Reflected XSS', 'Stored XSS', 'DOM XSS', 'Content Security Policy'],
      icon: '🔒'
    },
    {
      id: 'secure-auth',
      title: 'Secure Authentication & Authorization',
      description: 'Implement robust authentication and authorization systems',
      duration: '60 min',
      level: 'Intermediate',
      topics: ['Password Security', 'JWT', 'OAuth 2.0', 'Session Management'],
      icon: '🔐'
    },
    {
      id: 'api-security',
      title: 'API Security Best Practices',
      description: 'Secure your APIs against common vulnerabilities',
      duration: '40 min',
      level: 'Intermediate',
      topics: ['OWASP API Top 10', 'Rate Limiting', 'Input Validation', 'API Keys'],
      icon: '⚡'
    },
    {
      id: 'cryptography',
      title: 'Applied Cryptography',
      description: 'Understand encryption, hashing, and secure key management',
      duration: '50 min',
      level: 'Advanced',
      topics: ['Symmetric Encryption', 'Asymmetric Encryption', 'Hashing', 'Key Management'],
      icon: '🔑'
    },
    {
      id: 'secure-coding',
      title: 'Secure Coding Principles',
      description: 'Write secure code following industry best practices',
      duration: '90 min',
      level: 'Beginner',
      topics: ['Input Validation', 'Error Handling', 'Secure Dependencies', 'Code Review'],
      icon: '💻'
    },
  ];

  const achievements = [
    { name: 'First Course Complete', icon: '🎓', earned: true },
    { name: 'SQL Injection Master', icon: '🛡️', earned: true },
    { name: 'XSS Expert', icon: '🔒', earned: false },
    { name: 'Security Champion', icon: '🏆', earned: false },
  ];

  const getLevelColor = (level) => {
    return level === 'Beginner' ? 'bg-green-500/10 text-green-500 border-green-500/30'
      : level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      : 'bg-red-500/10 text-red-500 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-red-500" />
            Security Training Academy
          </h1>
          <p className="text-gray-400 mt-2">Learn secure coding practices and vulnerability prevention</p>
        </div>

        {/* User Progress */}
        {user && (
          <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30 mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">2</div>
                  <div className="text-sm text-gray-400">Courses Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">33%</div>
                  <div className="text-sm text-gray-400">Overall Progress</div>
                  <Progress value={33} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">2</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">4</div>
                  <div className="text-sm text-gray-400">Hours Learned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Available Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700 h-full hover:border-red-500/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-4xl">{course.icon}</div>
                      <Badge className={`${getLevelColor(course.level)} border`}>
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">{course.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen className="h-3 w-3" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Target className="h-3 w-3" />
                        {course.topics.length} topics
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.topics.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Link to={createPageUrl('CourseLab') + '?id=' + course.id}>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg text-center ${
                    achievement.earned
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : 'bg-gray-900/50 border border-gray-700 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-sm text-white font-medium">{achievement.name}</div>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}