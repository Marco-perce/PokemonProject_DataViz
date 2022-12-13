
# %% [code]
---
title: "Pokemon Battles"
author: "Jonathan Bouchet"
date: "`r Sys.Date()`"
output:
 html_document:
    fig_width: 10
    fig_height: 7
    toc: yes
    number_sections : yes
    code_folding: show
---
​
<center><img src="http://i.imgur.com/oJkBNgX.jpg">
</center>
​
```{r setup}
options(width=100)
knitr::opts_chunk$set(out.width='1000px',dpi=200,message=FALSE,warning=FALSE)
```
​
```{r}
#load packages and csv file
library(ggplot2)
library(dplyr)
library(gridExtra)
library(corrplot)
library(caret)
library(ggthemes)
library(RColorBrewer)
library(fmsb)
library(rpart.plot)
library(ROCR)
```
​
#Data preparation
​
* some columns renaming
* make a DF with proper color by pokemon `type` (colors found [here](http://www.epidemicjohto.com/t882-type-colors-hex-colors))
​
```{r}
pokemon<-read.csv("../input/pokemon.csv",sep=",",stringsAsFactors=F)
colnames(pokemon)<-c("id","Name","Type.1","Type.2","HP","Attack","Defense","Sp.Atk","Sp.Def","Speed","Generation","Legendary")
Type.1<-c("Dragon","Steel","Flying","Psychic","Rock" ,"Fire","Electric" ,"Dark","Ghost" ,"Ground","Ice", "Water","Grass","Fighting", "Fairy" ,"Poison","Normal","Bug")
color<-c("#6F35FC","#B7B7CE","#A98FF3","#F95587","#B6A136","#EE8130","#F7D02C","#705746","#735797","#E2BF65","#96D9D6","#6390F0","#7AC74C","#C22E28","#D685AD","#A33EA1","#A8A77A","#A6B91A")
COL<-data.frame(Type.1,color)
```
​
For the modeling, since each battle consists of 1 pokemon vs. another, we can to look at 
​
* the difference of numerical features(`HP`,`Attack`,`Defense`,`Sp.Atk`,`Sp.Def`,`Speed`)
* the `Type` of pokemon
* the legendary flavor (`True` or `Not`)
​
#Pokemon Overview
​
* The overview gives the big picture, in term of Type and Legendary flavor
* the inner `merge` is to calculate the total number of pokemon by Type, then the number of legendary in each type
* the outer `merge` is with the inner `merge` and the colors dataframe
* mostly for cosmetics purposes ...
* the `alpha` level controls the `Legendary` number ; `scale_alpha_discrete` is quite useful here
​
```{r}
merge(
  merge(pokemon %>% dplyr::group_by(Type.1) %>% dplyr::summarize(tot=n()),
        pokemon %>% dplyr::group_by(Type.1,Legendary) %>% dplyr::summarize(count=n()),by='Type.1'),
  COL, by='Type.1') %>% 
  ggplot(aes(x=reorder(Type.1,tot),y=count)) + 
  geom_bar(aes(fill=color,alpha=Legendary),color='white',size=.25,stat='identity') + 
  scale_fill_identity() + coord_flip() + theme_fivethirtyeight() + 
