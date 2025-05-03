import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Award, Star, Target, TrendingUp, Loader2 } from 'lucide-react';
import api from '@/services/apiService';

const Performance = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);
  
  // State for performance overview
  const [performanceOverview, setPerformanceOverview] = useState({
    currentRating: 0,
    previousRating: 0,
    nextReviewDate: '',
    reviewCycle: ''
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  
  // State for skills
  const [skills, setSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState(null);
  
  // State for goals
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [goalsError, setGoalsError] = useState(null);
  
  // State for feedback
  const [feedback, setFeedback] = useState([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  
  // Calculate goal completion percentage
  const [goalCompletionPercentage, setGoalCompletionPercentage] = useState(0);

  // Fetch employee ID first
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user || !user._id) {
        console.log('User or user._id not available yet:', user);
        return;
      }
      
      try {
        const userId = user.user?._id || user.createdBy || user._id;
        const response = await api.get(`/employees/by-user/${userId}`);
        setEmployeeId(response.data._id);
      } catch (err) {
        console.error('Error fetching employee ID:', err);
      }
    };
    
    fetchEmployeeId();
  }, [user]);
  
  // Fetch performance overview
  useEffect(() => {
    if (!employeeId) return;
    
    const fetchPerformanceOverview = async () => {
      try {
        setIsLoadingOverview(true);
        const response = await api.get(`/performance/employee/${employeeId}`);
        console.log('Performance overview response:', response.data);
        setPerformanceOverview({
          currentRating: response.data.overallRating || 0,
          previousRating: response.data.previousRating || 0,
          nextReviewDate: response.data.nextReviewDate ? new Date(response.data.nextReviewDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }) : 'Not scheduled',
          reviewCycle: response.data.reviewPeriod || 'N/A'
        });
        setOverviewError(null);
      } catch (err) {
        console.error('Error fetching performance overview:', err);
        setOverviewError('Failed to fetch performance data');
      } finally {
        setIsLoadingOverview(false);
      }
    };
    fetchPerformanceOverview();
  }, [employeeId]);
  
  // Fetch skills
  useEffect(() => {
    if (!employeeId) return;
    
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const response = await api.get(`/performance/employee/${employeeId}/skills`);
        console.log('Skills response:', response.data);
        const skillsData = response.data.length > 0 ? response.data : [
          { name: 'Communication', rating: 0, maxRating: 5 },
          { name: 'Technical Knowledge', rating: 0, maxRating: 5 },
          { name: 'Problem Solving', rating: 0, maxRating: 5 },
          { name: 'Teamwork', rating: 0, maxRating: 5 },
          { name: 'Leadership', rating: 0, maxRating: 5 }
        ];
        setSkills(skillsData);
        setSkillsError(null);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setSkillsError('Failed to fetch skills data');
      } finally {
        setIsLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [employeeId]);
  
  // Fetch goals
  useEffect(() => {
    if (!employeeId) return;
    
    const fetchGoals = async () => {
      try {
        setIsLoadingGoals(true);
        const response = await api.get(`/performance/employee/${employeeId}/goals`);
        console.log('Goals response:', response.data);
        const formattedGoals = response.data.map(goal => ({
          id: goal.id || Math.random().toString(36).substr(2, 9),
          title: goal.title,
          progress: goal.progress || 0,
          dueDate: new Date(goal.dueDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          status: goal.status || 'Not Started'
        }));
        setGoals(formattedGoals);
        if (formattedGoals.length > 0) {
          const totalProgress = formattedGoals.reduce((sum, goal) => sum + goal.progress, 0);
          const averageProgress = Math.round(totalProgress / formattedGoals.length);
          setGoalCompletionPercentage(averageProgress);
        } else {
          setGoalCompletionPercentage(0);
        }
        setGoalsError(null);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setGoalsError('Failed to fetch goals data');
      } finally {
        setIsLoadingGoals(false);
      }
    };
    fetchGoals();
  }, [employeeId]);
  
  // Fetch feedback
  useEffect(() => {
    if (!employeeId) return;
    
    const fetchFeedback = async () => {
      try {
        setIsLoadingFeedback(true);
        const response = await api.get(`/performance/employee/${employeeId}/feedback`);
        console.log('Feedback response:', response.data);
        const formattedFeedback = response.data.map(item => ({
          id: item._id,
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          reviewer: item.reviewer?.name || 'Anonymous',
          content: item.feedback || '',
          rating: item.rating || 0
        }));
        setFeedback(formattedFeedback);
        setFeedbackError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setFeedbackError('Failed to fetch feedback data');
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, [employeeId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Performance</h1>
        <p className="text-muted-foreground">
          Track your performance metrics, goals, and feedback
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOverview ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : overviewError ? (
              <div className="text-sm text-red-500">{overviewError}</div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="text-3xl font-bold mr-2">{performanceOverview.currentRating.toFixed(1)}</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        fill={star <= Math.floor(performanceOverview.currentRating) ? 'currentColor' : 'none'} 
                        className="h-4 w-4 text-yellow-400" 
                      />
                    ))}
                  </div>
                </div>
                {performanceOverview.previousRating > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {performanceOverview.currentRating > performanceOverview.previousRating 
                      ? `+${(performanceOverview.currentRating - performanceOverview.previousRating).toFixed(1)} from last review` 
                      : `${(performanceOverview.currentRating - performanceOverview.previousRating).toFixed(1)} from last review`}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOverview ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : overviewError ? (
              <div className="text-sm text-red-500">{overviewError}</div>
            ) : (
              <>
                <div className="text-xl font-bold">{performanceOverview.nextReviewDate}</div>
                <p className="text-xs text-muted-foreground mt-1">Review Cycle: {performanceOverview.reviewCycle}</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingGoals ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : goalsError ? (
              <div className="text-sm text-red-500">{goalsError}</div>
            ) : (
              <>
                <div className="text-xl font-bold">{goalCompletionPercentage}%</div>
                <Progress value={goalCompletionPercentage} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{goals.length} active goals</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Assessment</CardTitle>
              <CardDescription>Your performance across key skill areas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSkills ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : skillsError ? (
                <div className="text-center text-red-500 py-4">{skillsError}</div>
              ) : skills.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No skill assessment data available
                </div>
              ) : (
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{(skill.rating / skill.maxRating * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(skill.rating / skill.maxRating * 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Your current goals and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGoals ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : goalsError ? (
                <div className="text-center text-red-500 py-4">{goalsError}</div>
              ) : goals.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No goals data available
                </div>
              ) : (
                <div className="space-y-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">Due: {goal.dueDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : goal.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Feedback</CardTitle>
              <CardDescription>Feedback from your manager and team</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFeedback ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedbackError ? (
                <div className="text-center text-red-500 py-4">{feedbackError}</div>
              ) : feedback.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No feedback data available
                </div>
              ) : (
                <div className="space-y-6">
                  {feedback.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.reviewer}</h3>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">{item.rating.toFixed(1)}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance; 